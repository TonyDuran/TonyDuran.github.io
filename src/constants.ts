// type Period = "Today" | "This Week" | "This Month"
export const periods = ["Today", "This Week", "This Month"] as const

export type Period = typeof periods[number]


