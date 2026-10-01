import { useEffect, useState } from "react"
import { User } from "firebase/auth"
import { ParkingLotItem } from "../../types"
import {
  deleteParkingItemFromFirestore,
  saveParkingItemToFirestore,
  subscribeToParkingLot,
} from "../../services/parking-lot"
import { PARKING_LOT_STORAGE_KEY } from "../consts/storage-keys"
import { createParkingLotItem } from "../utils/parking-lot"
import { readStoredList, writeStoredList } from "../utils/storage"

const SYNC_FAILED = "Couldn't sync with your account. Your change is saved on this device."

export function useParkingLot(currentUser: User | null) {
  const [parkingLot, setParkingLot] = useState<ParkingLotItem[]>(() =>
    readStoredList<ParkingLotItem>(PARKING_LOT_STORAGE_KEY, [], "parking lot"),
  )
  const [parkingLotError, setParkingLotError] = useState<string | null>(null)

  // When user is authenticated, listen to the Firestore parking lot
  useEffect(() => {
    if (!currentUser) return

    const unsubParking = subscribeToParkingLot(currentUser.uid, (remoteItems) => {
      if (remoteItems.length > 0) {
        setParkingLot(remoteItems)
      }
    })

    return () => unsubParking()
  }, [currentUser])

  // Sync parking lot to localStorage
  useEffect(() => {
    writeStoredList(PARKING_LOT_STORAGE_KEY, parkingLot)
  }, [parkingLot])

  // A parked thought is local first, so a failed sync must not look like a
  // lost thought, and it must not surface as an unhandled rejection either.
  const addParkingLotItem = (text: string) => {
    const item = createParkingLotItem(text, currentUser?.uid)
    setParkingLot((prev) => [item, ...prev])
    if (!currentUser) return
    setParkingLotError(null)
    saveParkingItemToFirestore(currentUser.uid, item).catch(() => {
      setParkingLotError(SYNC_FAILED)
    })
  }

  const deleteParkingLotItem = (id: string) => {
    setParkingLot((prev) => prev.filter((p) => p.id !== id))
    if (!currentUser) return
    setParkingLotError(null)
    deleteParkingItemFromFirestore(currentUser.uid, id).catch(() => {
      setParkingLotError(SYNC_FAILED)
    })
  }

  return {
    parkingLot,
    parkingLotError,
    clearParkingLotError: () => setParkingLotError(null),
    addParkingLotItem,
    deleteParkingLotItem,
  }
}
