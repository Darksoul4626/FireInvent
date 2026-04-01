import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RentalCalendar } from "@/components/rental-calendar";

const pushMock = vi.fn();

vi.mock("@fullcalendar/react", () => ({
    default: () => <div data-testid="fullcalendar" />
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    usePathname: () => "/calendar",
    useSearchParams: () => new URLSearchParams("view=table")
}));

describe("RentalCalendar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("filters entries by selected item", () => {
        render(
            <RentalCalendar
                selectedItemId="item-1"
                itemOptions={[
                    { id: "item-1", label: "INV-1 - Generator" },
                    { id: "item-2", label: "INV-2 - Pumpe" }
                ]}
                rentals={[
                    {
                        id: "r1",
                        itemId: "item-1",
                        itemLabel: "INV-1 - Generator",
                        startDate: "2026-03-10T10:00:00.000Z",
                        endDate: "2026-03-10T12:00:00.000Z",
                        quantity: 1,
                        status: "Planned"
                    },
                    {
                        id: "r2",
                        itemId: "item-2",
                        itemLabel: "INV-2 - Pumpe",
                        startDate: "2026-03-11T10:00:00.000Z",
                        endDate: "2026-03-11T12:00:00.000Z",
                        quantity: 2,
                        status: "Active"
                    }
                ]}
            />
        );

        expect(screen.getByTestId("calendar-visible-count")).toHaveTextContent(
            "Zeige 1 Termin(e) fuer den ausgewaehlten Gegenstand."
        );
        expect(screen.getByTestId("calendar-table-row-r1")).toBeInTheDocument();
        expect(screen.queryByTestId("calendar-table-row-r2")).not.toBeInTheDocument();
    });

    it("updates query params when filter changes", async () => {
        const user = userEvent.setup();
        render(
            <RentalCalendar
                itemOptions={[
                    { id: "item-1", label: "INV-1 - Generator" },
                    { id: "item-2", label: "INV-2 - Pumpe" }
                ]}
                rentals={[]}
            />
        );

        await user.selectOptions(screen.getByTestId("calendar-item-filter"), "item-2");

        expect(pushMock).toHaveBeenCalledTimes(1);
        expect(pushMock.mock.calls[0][0]).toContain("itemId=item-2");
    });

    it("does not render conflict legends or conflict columns", () => {
        render(
            <RentalCalendar
                itemOptions={[{ id: "item-1", label: "INV-1 - Generator" }]}
                rentals={[
                    {
                        id: "r1",
                        itemId: "item-1",
                        itemLabel: "INV-1 - Generator",
                        startDate: "2026-03-10T10:00:00.000Z",
                        endDate: "2026-03-10T12:00:00.000Z",
                        quantity: 1,
                        status: "Planned"
                    }
                ]}
            />
        );

        expect(screen.queryByText(/Conflict:/i)).not.toBeInTheDocument();
        expect(screen.queryByRole("columnheader", { name: "Konflikt" })).not.toBeInTheDocument();
    });
});
