import { useParams } from 'react-router-dom'
import PatientRecordView from '../../components/shared/PatientRecordView'

export default function PatientDetail() {
  const { patientId } = useParams()
  return <PatientRecordView patientId={patientId} backTo="/admin/patients" backLabel="Back to Patients" />
}
