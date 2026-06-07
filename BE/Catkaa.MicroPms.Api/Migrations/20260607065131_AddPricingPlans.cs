using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Catkaa.MicroPms.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PricingPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Price = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FeaturesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BtnText = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsPopular = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingPlans", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "PricingPlans",
                columns: new[] { "Id", "BtnText", "FeaturesJson", "IsActive", "IsPopular", "Name", "Price", "Subtitle" },
                values: new object[,]
                {
                    { 1, "Dùng Thử", "[{\"name\":\"Micro PMS\",\"value\":\"Có\"},{\"name\":\"PA72 Excel Export\",\"value\":\"Có (Chuẩn 100%)\",\"highlight\":true},{\"name\":\"Hạn mức OCR\",\"value\":\"30 lượt/tháng\"},{\"name\":\"Nhắc nhở chủ nhà\",\"value\":\"Có\"},{\"name\":\"Smart Lock\",\"value\":\"Không\",\"disabled\":true}]", true, false, "GÓI TRẢI NGHIỆM", "0 VNĐ", "(Free Trial)" },
                    { 2, "Đăng Ký", "[{\"name\":\"Micro PMS\",\"value\":\"Sở hữu vĩnh viễn\"},{\"name\":\"PA72 Excel Export\",\"value\":\"Có\"},{\"name\":\"Hạn mức OCR\",\"value\":\"Trả phí theo lượt dùng\"},{\"name\":\"Nhắc nhở chủ nhà\",\"value\":\"Có\"},{\"name\":\"Smart Lock\",\"value\":\"Mua đứt phần cứng\"}]", true, true, "Gói SỞ HỮU", "Giá khóa + Phí setup", "(Basic - Mua đứt)" },
                    { 3, "Đăng Ký", "[{\"name\":\"Micro PMS\",\"value\":\"Thuê bao hàng tháng\"},{\"name\":\"PA72 Excel Export\",\"value\":\"Có\"},{\"name\":\"Hạn mức OCR\",\"value\":\"Không giới hạn*\",\"highlight\":true},{\"name\":\"Nhắc nhở chủ nhà\",\"value\":\"Có\"},{\"name\":\"Smart Lock\",\"value\":\"Thuê phần cứng (HaaS)\"}]", true, false, "GÓI TOÀN DIỆN", "899.000 VNĐ / tháng", "(Pro - Thuê bao)" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PricingPlans");
        }
    }
}
