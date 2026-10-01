import { MicroTask, ParkingLotItem } from "../../../types"

export interface FocusProps {
  task: MicroTask
  isOpen: boolean
  onClose: () => void
  onCompleteTask: (taskId: string) => void
  parkingLot: ParkingLotItem[]
  parkingLotError?: string | null
  onAddParkingLotItem: (text: string) => void
  onDeleteParkingLotItem: (id: string) => void
}
