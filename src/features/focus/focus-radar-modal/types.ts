import { MicroTask, ParkingLotItem } from "../../../types"

export interface FocusRadarModalProps {
  task: MicroTask
  isOpen: boolean
  onClose: () => void
  onCompleteTask: (taskId: string) => void
  parkingLot: ParkingLotItem[]
  onAddParkingLotItem: (text: string) => void
  onDeleteParkingLotItem: (id: string) => void
}
