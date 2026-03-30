using FireInvent.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Infrastructure.Persistence;

public sealed class FireInventDbContext(DbContextOptions<FireInventDbContext> options) : DbContext(options)
{
    public DbSet<InventoryCategory> InventoryCategories => Set<InventoryCategory>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<RentalBooking> RentalBookings => Set<RentalBooking>();
    public DbSet<RentalBookingLine> RentalBookingLines => Set<RentalBookingLine>();

    public async Task<FireInventSeedResult> InitializeDatabaseAsync(CancellationToken cancellationToken)
    {
        if (Database.IsInMemory())
        {
            await Database.EnsureCreatedAsync(cancellationToken);
        }
        else
        {
            await Database.MigrateAsync(cancellationToken);
        }

        var seedMode = FireInventSeedData.ParseMode(Environment.GetEnvironmentVariable("FIREINVENT_SEED_MODE"));
        return await FireInventSeedData.SeedAsync(this, seedMode, cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<InventoryCategory>(entity =>
        {
            entity.ToTable("inventory_categories");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(128)
                .IsRequired();

            entity.HasIndex(e => e.Name)
                .IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("now()")
                .IsRequired();
        });

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.ToTable("inventory_items");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.InventoryCode)
                .HasColumnName("inventory_code")
                .HasMaxLength(64)
                .IsRequired();

            entity.HasIndex(e => e.InventoryCode)
                .IsUnique();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(256)
                .IsRequired();

            entity.Property(e => e.Category)
                .HasColumnName("category")
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(e => e.CategoryId)
                .HasColumnName("category_id")
                .IsRequired();

            entity.HasOne(e => e.CategoryEntity)
                .WithMany(c => c.Items)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.Condition)
                .HasColumnName("condition")
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(e => e.TotalQuantity)
                .HasColumnName("total_quantity")
                .IsRequired();

            entity.ToTable(t => t.HasCheckConstraint(
                "ck_inventory_items_total_quantity_positive",
                "total_quantity > 0"));

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("now()")
                .IsRequired();

            entity.HasIndex(e => e.CategoryId);
        });

        modelBuilder.Entity<RentalBooking>(entity =>
        {
            entity.ToTable("rental_bookings");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.ItemId)
                .HasColumnName("item_id")
                .IsRequired();

            entity.HasOne(e => e.Item)
                .WithMany(i => i.RentalBookings)
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.StartDate)
                .HasColumnName("start_date")
                .IsRequired();

            entity.Property(e => e.EndDate)
                .HasColumnName("end_date")
                .IsRequired();

            entity.Property(e => e.Quantity)
                .HasColumnName("quantity")
                .IsRequired();

            entity.Property(e => e.BorrowerName)
                .HasColumnName("borrower_name")
                .HasMaxLength(256);

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("now()")
                .IsRequired();

            entity.HasIndex(e => new { e.ItemId, e.StartDate, e.EndDate });

            entity.HasMany(e => e.Lines)
                .WithOne(l => l.RentalBooking)
                .HasForeignKey(l => l.RentalBookingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.ToTable(t =>
            {
                t.HasCheckConstraint("ck_rental_bookings_quantity_positive", "quantity > 0");
                t.HasCheckConstraint("ck_rental_bookings_date_range", "end_date >= start_date");
            });
        });

        modelBuilder.Entity<RentalBookingLine>(entity =>
        {
            entity.ToTable("rental_booking_lines");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.RentalBookingId)
                .HasColumnName("rental_booking_id")
                .IsRequired();

            entity.Property(e => e.ItemId)
                .HasColumnName("item_id")
                .IsRequired();

            entity.HasOne(e => e.Item)
                .WithMany(i => i.RentalBookingLines)
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.Quantity)
                .HasColumnName("quantity")
                .IsRequired();

            entity.HasIndex(e => e.RentalBookingId);
            entity.HasIndex(e => e.ItemId);
            entity.HasIndex(e => new { e.RentalBookingId, e.ItemId }).IsUnique();

            entity.ToTable(t =>
            {
                t.HasCheckConstraint("ck_rental_booking_lines_quantity_positive", "quantity > 0");
            });
        });
    }
}
