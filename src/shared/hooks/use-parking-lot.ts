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

export function useParkingLot(currentUser: User | null) {
  const [parkingLot, setParkingLot] = useState<ParkingLotItem[]>(() =>
    readStoredList<ParkingLotItem>(PARKING_LOT_STORAGE_KEY, [], "parking lot"),
  )

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

  const addParkingLotItem = (text: string) => {
    const item = createParkingLotItem(text, currentUser?.uid)
    setParkingLot((prev) => [item, ...prev])
    if (currentUser) {
      saveParkingItemToFirestore(currentUser.uid, item)
    }
  }

  const deleteParkingLotItem = (id: string) => {
    setParkingLot((prev) => prev.filter((p) => p.id !== id))
    if (currentUser) {
      deleteParkingItemFromFirestore(currentUser.uid, id)
    }
  }

  return { parkingLot, addParkingLotItem, deleteParkingLotItem }
}
