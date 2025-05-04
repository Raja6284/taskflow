import "@testing-library/jest-dom"

// Mock the next/router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}))

// Mock zustand persist
jest.mock("zustand/middleware", () => ({
  persist: () => (fn) => fn,
}))

// Mock date-fns
jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),
  addDays: jest.fn((date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }),
  addWeeks: jest.fn((date, weeks) => {
    const result = new Date(date)
    result.setDate(result.getDate() + weeks * 7)
    return result
  }),
  addMonths: jest.fn((date, months) => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }),
  addYears: jest.fn((date, years) => {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }),
  format: jest.fn(() => "Jan 1, 2023"),
  isBefore: jest.fn(() => true),
}))
