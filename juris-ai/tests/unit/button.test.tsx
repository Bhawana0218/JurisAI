import { render, screen } from "@testing-library/react"

function Button() {
  return <button>Click Me</button>
}

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button />)

    expect(screen.getByText("Click Me")).toBeInTheDocument()
  })
})