using Catkaa.MicroPms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catkaa.MicroPms.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<CheckInRecord> CheckInRecords { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PricingPlan> PricingPlans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.BookingCode)
                .IsUnique();

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Hotel)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany()
                .HasForeignKey(b => b.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CheckInRecord>()
                .HasOne(c => c.Hotel)
                .WithMany(h => h.CheckInRecords)
                .HasForeignKey(c => c.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hotel>()
                .HasOne(h => h.Host)
                .WithMany(u => u.Hotels)
                .HasForeignKey(h => h.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed PricingPlans
            modelBuilder.Entity<PricingPlan>().HasData(
                new PricingPlan
                {
                    Id = 1,
                    Name = "GÓI TRẢI NGHIỆM",
                    Subtitle = "(Free Trial)",
                    Price = "0 VNĐ",
                    FeaturesJson = "[{\"name\":\"Micro PMS\",\"value\":\"Có\"},{\"name\":\"PA72 Excel Export\",\"value\":\"Có (Chuẩn 100%)\",\"highlight\":true},{\"name\":\"Hạn mức OCR\",\"value\":\"30 lượt/tháng\"},{\"name\":\"Nhắc nhở chủ nhà\",\"value\":\"Có\"},{\"name\":\"Smart Lock\",\"value\":\"Không\",\"disabled\":true}]",
                    BtnText = "Dùng Thử",
                    IsPopular = false,
                    IsActive = true
                },
                new PricingPlan
                {
                    Id = 2,
                    Name = "Gói SỞ HỮU",
                    Subtitle = "(Basic - Mua đứt)",
                    Price = "Giá khóa + Phí setup",
                    FeaturesJson = "[{\"name\":\"Micro PMS\",\"value\":\"Sở hữu vĩnh viễn\"},{\"name\":\"PA72 Excel Export\",\"value\":\"Có\"},{\"name\":\"Hạn mức OCR\",\"value\":\"Trả phí theo lượt dùng\"},{\"name\":\"Nhắc nhở chủ nhà\",\"value\":\"Có\"},{\"name\":\"Smart Lock\",\"value\":\"Mua đứt phần cứng\"}]",
                    BtnText = "Đăng Ký",
                    IsPopular = true,
                    IsActive = true
                },
                new PricingPlan
                {
                    Id = 3,
                    Name = "GÓI TOÀN DIỆN",
                    Subtitle = "(Pro - Thuê bao)",
                    Price = "899.000 VNĐ / tháng",
                    FeaturesJson = "[{\"name\":\"Micro PMS\",\"value\":\"Thuê bao hàng tháng\"},{\"name\":\"PA72 Excel Export\",\"value\":\"Có\"},{\"name\":\"Hạn mức OCR\",\"value\":\"Không giới hạn*\",\"highlight\":true},{\"name\":\"Nhắc nhở chủ nhà\",\"value\":\"Có\"},{\"name\":\"Smart Lock\",\"value\":\"Thuê phần cứng (HaaS)\"}]",
                    BtnText = "Đăng Ký",
                    IsPopular = false,
                    IsActive = true
                }
            );
        }
    }
}
