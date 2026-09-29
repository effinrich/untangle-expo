import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore"
import { ParkingLotItem } from "../types"
import { db } from "./firebase"
import { OperationType, handleFirestoreError } from "./firestore-errors"

// Subscribe to parking lot items
export function subscribeToParkingLot(
  userId: string,
  onItemsUpdated: (items: ParkingLotItem[]) => void,
): () => void {
  const path = `users/${userId}/parkingLot`
  const itemsRef = collection(db, "users", userId, "parkingLot")

  return onSnapshot(
    itemsRef,
    (snapshot) => {
      const items: ParkingLotItem[] = []
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ParkingLotItem)
      })
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      onItemsUpdated(items)
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path)
    },
  )
}

// Save parking lot item
export async function saveParkingItemToFirestore(
  userId: string,
  item: ParkingLotItem,
): Promise<void> {
  const path = `users/${userId}/parkingLot/${item.id}`
  try {
    const docRef = doc(db, "users", userId, "parkingLot", item.id)
    await setDoc(docRef, {
      id: item.id,
      userId,
      text: item.text.slice(0, 500),
      createdAt: item.createdAt || new Date().toISOString(),
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path)
  }
}

// Delete parking lot item
export async function deleteParkingItemFromFirestore(
  userId: string,
  itemId: string,
): Promise<void> {
  const path = `users/${userId}/parkingLot/${itemId}`
  try {
    const docRef = doc(db, "users", userId, "parkingLot", itemId)
    await deleteDoc(docRef)
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path)
  }
}
