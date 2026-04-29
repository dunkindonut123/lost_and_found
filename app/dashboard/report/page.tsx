import { createClient } from '@/lib/supabase/server'
import { ReportItemForm } from '@/components/report-item-form'

export default async function ReportItemPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Report Found Item</h1>
        <p className="text-muted-foreground mt-1">
          Help reunite lost items with their owners by reporting what you&apos;ve found
        </p>
      </div>

      <ReportItemForm categories={categories || []} />
    </div>
  )
}
