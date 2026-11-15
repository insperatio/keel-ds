// The same brief, answered with no design system: plain Tailwind in a fresh project.
// This is not a strawman — it is the shape of a competent quick answer. Every problem the
// checks find here is one that a system is supposed to prevent, not one invented to lose.
import { useState } from 'react'

const members = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'Active' },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'Active' },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'Editor', status: 'Invited' },
]

export default function WithoutKeel() {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto w-[720px] rounded-lg bg-white p-8 shadow">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Team settings</h1>
        <p className="mb-8 text-sm text-gray-400">Manage who can access this workspace.</p>

        <h2 className="mb-3 text-lg font-semibold text-gray-900">Invite a teammate</h2>
        <div className="mb-8 flex items-end gap-2">
          <input
            type="email"
            placeholder="Email address"
            className="h-9 flex-1 rounded border border-gray-300 px-3 text-sm focus:outline-none"
          />
          <select className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none">
            <option>Editor</option>
            <option>Admin</option>
            <option>Owner</option>
          </select>
          <button className="h-9 rounded bg-blue-500 px-4 text-sm text-white hover:bg-blue-600 focus:outline-none">
            Send invite
          </button>
        </div>
        <p className="-mt-6 mb-8 text-xs text-gray-400">They will get an email with a link that expires in 7 days.</p>

        <h2 className="mb-3 text-lg font-semibold text-gray-900">Members</h2>
        <table className="mb-8 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-400">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-b border-gray-100">
                <td className="py-3">
                  <div className="text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                </td>
                <td className="py-3 text-gray-600">{m.role}</td>
                <td className="py-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${m.status === 'Active' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                </td>
                <td className="py-3 text-right">
                  <button className="rounded p-1 text-gray-400 hover:bg-gray-100 focus:outline-none">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 4h10M6.5 4V3h3v1M5 4l.5 9h5L11 4" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mb-3 text-lg font-semibold text-red-600">Danger zone</h2>
        <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 p-4">
          <div>
            <div className="text-sm font-medium text-gray-900">Delete this workspace</div>
            <div className="text-xs text-gray-400">This cannot be undone.</div>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="h-8 rounded bg-red-500 px-3 text-sm text-white hover:bg-red-600 focus:outline-none"
          >
            Delete workspace
          </button>
        </div>

        {confirming && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="w-[400px] rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-2 text-lg font-semibold text-gray-900">Are you sure?</div>
              <p className="mb-6 text-sm text-gray-400">This deletes the workspace and everything in it.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirming(false)} className="h-8 rounded px-3 text-sm text-gray-500 focus:outline-none">
                  Cancel
                </button>
                <button className="h-8 rounded bg-red-500 px-3 text-sm text-white opacity-50 focus:outline-none" disabled>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
