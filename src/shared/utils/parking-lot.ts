import { ParkingLotItem } from "../../types"

export function createParkingLotItem(text: string, userId: string | undefined): ParkingLotItem {
  return {
    id: `parking_${Date.now()}`,
    userId,
    text,
    createdAt: new Date().toISOString(),
  }
}
