import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminUsers } from '@/lib/admin-analytics'
import { getClerkUserProfiles } from '@/lib/admin'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = await getAdminUsers()
  const profiles = await getClerkUserProfiles(users.map((user) => user.userId))

  return (
    <div className="text-white animate-fade-in-up">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 snap-gradient-text-static flex items-center gap-3">
          <Users className="h-8 w-8 text-cyan-400" />
          Users
        </h1>
        <p className="text-zinc-400">
          {users.length} creator{users.length !== 1 ? 's' : ''} on the platform
        </p>
      </div>

      <Card className="snap-card">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Pages</th>
                  <th className="pb-3 pr-4 font-medium">Views</th>
                  <th className="pb-3 pr-4 font-medium">This Month</th>
                  <th className="pb-3 pr-4 font-medium">Created Today</th>
                  <th className="pb-3 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const profile = profiles.get(user.userId)
                  const label =
                    profile?.name ||
                    profile?.email ||
                    profile?.username ||
                    user.userId

                  return (
                    <tr key={user.userId} className="border-b border-white/5">
                      <td className="py-4 pr-4">
                        <Link
                          href={`/admin/users/${user.userId}`}
                          className="flex items-center gap-3 group"
                        >
                          {profile?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.imageUrl}
                              alt=""
                              className="h-9 w-9 rounded-full border border-white/10"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-white/10 border border-white/10" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                              {label}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              {profile?.email ?? user.userId}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          className={
                            user.blocked
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }
                        >
                          {user.blocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {user.pageCount}
                        <span className="text-zinc-500 text-xs block">
                          {user.publicPages} public · {user.privatePages} private
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {user.totalViews.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {user.viewsThisMonth.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {user.pagesCreatedToday}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {user.lastPageCreatedAt
                          ? user.lastPageCreatedAt.toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
