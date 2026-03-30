using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FireInvent.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RentalLineAndCategoryNormalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "borrower_name",
                table: "rental_bookings",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "category_id",
                table: "inventory_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "inventory_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rental_booking_lines",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    rental_booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rental_booking_lines", x => x.id);
                    table.CheckConstraint("ck_rental_booking_lines_quantity_positive", "quantity > 0");
                    table.ForeignKey(
                        name: "FK_rental_booking_lines_inventory_items_item_id",
                        column: x => x.item_id,
                        principalTable: "inventory_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_rental_booking_lines_rental_bookings_rental_booking_id",
                        column: x => x.rental_booking_id,
                        principalTable: "rental_bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(
                """
                INSERT INTO inventory_categories (id, name, created_at, updated_at)
                SELECT
                    gen_random_uuid(),
                    COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized'),
                    now(),
                    now()
                FROM inventory_items
                GROUP BY COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized');
                """);

            migrationBuilder.Sql(
                """
                UPDATE inventory_items AS i
                SET category_id = c.id
                FROM inventory_categories AS c
                WHERE c.name = COALESCE(NULLIF(TRIM(i.category), ''), 'Uncategorized');
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO rental_booking_lines (id, rental_booking_id, item_id, quantity)
                SELECT
                    gen_random_uuid(),
                    id,
                    item_id,
                    quantity
                FROM rental_bookings;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "category_id",
                table: "inventory_items",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_inventory_items_category_id",
                table: "inventory_items",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_categories_name",
                table: "inventory_categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_rental_booking_lines_item_id",
                table: "rental_booking_lines",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_rental_booking_lines_rental_booking_id",
                table: "rental_booking_lines",
                column: "rental_booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_rental_booking_lines_rental_booking_id_item_id",
                table: "rental_booking_lines",
                columns: new[] { "rental_booking_id", "item_id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_items_inventory_categories_category_id",
                table: "inventory_items",
                column: "category_id",
                principalTable: "inventory_categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_inventory_items_inventory_categories_category_id",
                table: "inventory_items");

            migrationBuilder.DropTable(
                name: "inventory_categories");

            migrationBuilder.DropTable(
                name: "rental_booking_lines");

            migrationBuilder.DropIndex(
                name: "IX_inventory_items_category_id",
                table: "inventory_items");

            migrationBuilder.DropColumn(
                name: "borrower_name",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "inventory_items");
        }
    }
}
