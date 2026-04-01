using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FireInvent.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inventory_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    inventory_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    category = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    condition = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    location = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    total_quantity = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_items", x => x.id);
                    table.CheckConstraint("ck_inventory_items_total_quantity_positive", "total_quantity > 0");
                });

            migrationBuilder.CreateTable(
                name: "rental_bookings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rental_bookings", x => x.id);
                    table.CheckConstraint("ck_rental_bookings_date_range", "end_date >= start_date");
                    table.CheckConstraint("ck_rental_bookings_quantity_positive", "quantity > 0");
                    table.ForeignKey(
                        name: "FK_rental_bookings_inventory_items_item_id",
                        column: x => x.item_id,
                        principalTable: "inventory_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_items_inventory_code",
                table: "inventory_items",
                column: "inventory_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_rental_bookings_item_id_start_date_end_date",
                table: "rental_bookings",
                columns: new[] { "item_id", "start_date", "end_date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rental_bookings");

            migrationBuilder.DropTable(
                name: "inventory_items");
        }
    }
}
