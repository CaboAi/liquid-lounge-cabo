import type { Database } from "@/lib/supabase/types"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type StudioCardProps = {
  studio: Pick<Database['public']['Tables']['studios']['Row'], 'id' | 'name' | 'slug' | 'description' | 'address' | 'logo_url' | 'is_active'>
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <Link href={`/studios/${studio.slug}`}>
      <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{studio.name}</CardTitle>
            <Badge variant={studio.is_active ? 'default' : 'secondary'}>
              {studio.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{studio.address ?? 'Address TBD'}</p>
        </CardHeader>
        {studio.description && (
          <CardContent>
            <p className="text-sm line-clamp-2">{studio.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
