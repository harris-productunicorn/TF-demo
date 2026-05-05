// Only used by vizzes that explicitly specify "default = YTD" in the PRD (Viz 3, 9, 10)
const year       = new Date().getFullYear()
const thisMonth  = new Date().toISOString().slice(0, 7)

export const YTD_MONTH_FILTERS = { start_month: `${year}-01`, end_month: thisMonth }
export const YTD_DATE_FILTERS  = { start_date: `${year}-01-01`, end_date: new Date().toISOString().slice(0, 10) }
