import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import Card from '../../components/ui/Card'
import { useQueue } from '../../context/QueueContext'
import { specialties } from '../../data/specialties'
import { doctors, getDoctorById } from '../../data/doctors'
import { TOKEN_STATUS } from '../../data/tokens'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const BRAND_MAROON = '#a32638'
const BRAND_GREEN = '#0f6b4f'

export default function AnalyticsPage() {
  const { tokens } = useQueue()

  const tokensBySpecialty = specialties.map(
    (s) => tokens.filter((t) => getDoctorById(t.doctorId)?.specialtyId === s.id).length,
  )

  const statusCounts = Object.values(TOKEN_STATUS).map(
    (status) => tokens.filter((t) => t.status === status).length,
  )

  const tokensByDoctor = doctors.map((d) => tokens.filter((t) => t.doctorId === d.id).length)

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Analytics</h1>

      <div className="row g-4">
        <div className="col-lg-7">
          <Card>
            <div className="fw-semibold mb-3">Tokens by Specialty</div>
            <Bar
              data={{
                labels: specialties.map((s) => s.name),
                datasets: [{ label: 'Tokens', data: tokensBySpecialty, backgroundColor: BRAND_MAROON, borderRadius: 6 }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
            />
          </Card>
        </div>

        <div className="col-lg-5">
          <Card>
            <div className="fw-semibold mb-3">Token Status Breakdown</div>
            <Doughnut
              data={{
                labels: Object.values(TOKEN_STATUS).map((s) => s.replace('-', ' ')),
                datasets: [
                  {
                    data: statusCounts,
                    backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#9ca3af', '#ef4444', '#d1d5db', '#dc2626'],
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }}
            />
          </Card>
        </div>

        <div className="col-12">
          <Card>
            <div className="fw-semibold mb-3">Tokens by Doctor</div>
            <Bar
              data={{
                labels: doctors.map((d) => d.name),
                datasets: [{ label: 'Tokens', data: tokensByDoctor, backgroundColor: BRAND_GREEN, borderRadius: 6 }],
              }}
              options={{
                responsive: true,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
