import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType } from "docx";
import fs from "fs";
import path from "path";

/**
 * Service để xuất báo cáo ra các định dạng khác nhau (Excel, PDF, Word)
 */
export class ExportService {
  /**
   * Format số tiền VND
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  }

  /**
   * Format ngày
   */
  static formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  }

  /**
   * Xuất báo cáo doanh thu ra Excel
   */
  static async exportRevenueToExcel(reportData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo doanh thu");

    // Thiết lập độ rộng cột
    worksheet.columns = [
      { width: 20 },
      { width: 25 },
      { width: 20 },
      { width: 20 },
    ];

    // Header - Tiêu đề báo cáo
    worksheet.mergeCells("A1:D1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BÁO CÁO DOANH THU";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0066CC" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 30;

    // Thông tin khoảng thời gian
    worksheet.getCell("A2").value = "Khoảng thời gian:";
    worksheet.getCell("B2").value = `${this.formatDate(reportData.period?.startDate)} - ${this.formatDate(reportData.period?.endDate)}`;
    worksheet.getRow(2).font = { bold: true };

    // Tóm tắt
    worksheet.addRow([]);
    worksheet.addRow(["TỔNG QUAN"]).font = { bold: true, size: 12 };
    
    const summaryData = [
      ["Tổng doanh thu", this.formatCurrency(reportData.summary?.totalRevenue)],
      ["Tổng đơn hàng", reportData.summary?.totalOrders || 0],
      ["Đơn hoàn thành", reportData.summary?.completedOrders || 0],
      ["Đơn hủy", reportData.summary?.cancelledOrders || 0],
      ["Giá trị TB/đơn", this.formatCurrency(reportData.summary?.avgOrderValue)],
      ["Tỷ lệ hoàn thành", `${reportData.summary?.completionRate || 0}%`],
    ];

    summaryData.forEach((row) => {
      const excelRow = worksheet.addRow(row);
      excelRow.getCell(1).font = { bold: true };
      excelRow.getCell(2).font = { color: { argb: "FF006600" } };
    });

    // Doanh thu theo ngày
    worksheet.addRow([]);
    worksheet.addRow(["DOANH THU THEO NGÀY"]).font = { bold: true, size: 12 };
    
    const headerRow = worksheet.addRow(["Ngày", "Doanh thu", "Số đơn hàng"]);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };

    (reportData.dailyRevenue || []).forEach((item) => {
      worksheet.addRow([
        item.date,
        this.formatCurrency(item.revenue),
        item.orders,
      ]);
    });

    // Doanh thu theo phương thức thanh toán
    if (reportData.revenueByPaymentMethod && reportData.revenueByPaymentMethod.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow(["DOANH THU THEO PHƯƠNG THỨC THANH TOÁN"]).font = { bold: true, size: 12 };
      
      const paymentHeaderRow = worksheet.addRow(["Phương thức", "Doanh thu", "Số lượng"]);
      paymentHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      paymentHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF70AD47" },
      };

      reportData.revenueByPaymentMethod.forEach((item) => {
        worksheet.addRow([
          item.method || "Chưa xác định",
          this.formatCurrency(item.revenue),
          item.count,
        ]);
      });
    }

    return workbook;
  }

  /**
   * Xuất báo cáo tồn kho ra Excel
   */
  static async exportInventoryToExcel(reportData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo tồn kho");

    // Header
    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BÁO CÁO TỒN KHO";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF6600" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 30;

    // Tổng quan
    worksheet.addRow([]);
    worksheet.addRow(["TỔNG QUAN TỒN KHO"]).font = { bold: true, size: 12 };
    
    const summaryData = [
      ["Tổng sản phẩm", reportData.summary?.totalProducts || 0],
      ["Còn hàng", reportData.summary?.inStock || 0],
      ["Sắp hết", reportData.summary?.lowStock || 0],
      ["Hết hàng", reportData.summary?.outOfStock || 0],
      ["Tổng giá trị", this.formatCurrency(reportData.summary?.totalValue)],
    ];

    summaryData.forEach((row) => {
      const excelRow = worksheet.addRow(row);
      excelRow.getCell(1).font = { bold: true };
    });

    // Sản phẩm cần nhập thêm
    worksheet.addRow([]);
    worksheet.addRow(["SẢN PHẨM CẦN NHẬP THÊM"]).font = { bold: true, size: 12 };
    
    const headerRow = worksheet.addRow(["Tên sản phẩm", "SKU", "Tồn kho", "Giá", "Danh mục"]);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE74C3C" },
    };

    worksheet.columns = [
      { width: 35 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 20 },
    ];

    (reportData.needsRestock || []).forEach((item) => {
      const row = worksheet.addRow([
        item.name,
        item.sku,
        item.currentStock,
        this.formatCurrency(item.price),
        item.category,
      ]);
      
      // Highlight nếu hết hàng
      if (item.currentStock === 0) {
        row.getCell(3).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        row.getCell(3).font = { color: { argb: "FFFFFFFF" }, bold: true };
      }
    });

    // Danh sách tất cả sản phẩm
    worksheet.addRow([]);
    worksheet.addRow(["DANH SÁCH TẤT CẢ SẢN PHẨM"]).font = { bold: true, size: 12 };
    
    const allProductsHeaderRow = worksheet.addRow([
      "Tên sản phẩm", 
      "SKU", 
      "Tồn kho", 
      "Giá", 
      "Danh mục",
      "Giá trị",
      "Trạng thái"
    ]);
    allProductsHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    allProductsHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3498DB" },
    };

    worksheet.columns = [
      { width: 35 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
    ];

    (reportData.products || []).forEach((item) => {
      const row = worksheet.addRow([
        item.name,
        item.sku,
        item.stock,
        this.formatCurrency(item.price),
        item.category,
        this.formatCurrency(item.value),
        item.stockStatus,
      ]);
      
      // Highlight theo trạng thái tồn kho
      if (item.stock === 0) {
        row.getCell(3).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        row.getCell(3).font = { color: { argb: "FFFFFFFF" } };
      } else if (item.stock <= 5) {
        row.getCell(3).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFA500" },
        };
      }
    });

    return workbook;
  }

  /**
   * Xuất báo cáo sản phẩm bán chạy ra Excel
   */
  static async exportBestSellersToExcel(reportData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sản phẩm bán chạy");

    // Header
    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BÁO CÁO SẢN PHẨM BÁN CHẠY";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0066" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 30;

    worksheet.columns = [
      { width: 5 },
      { width: 35 },
      { width: 15 },
      { width: 12 },
      { width: 18 },
      { width: 12 },
    ];

    // Top sản phẩm bán chạy
    worksheet.addRow([]);
    worksheet.addRow(["TOP SẢN PHẨM BÁN CHẠY"]).font = { bold: true, size: 12 };
    
    const headerRow = worksheet.addRow(["#", "Tên sản phẩm", "SKU", "Đã bán", "Doanh thu", "Tồn kho"]);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF28A745" },
    };

    (reportData.bestSellers || []).forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1,
        item.productName,
        item.sku,
        item.totalSold,
        this.formatCurrency(item.totalRevenue),
        item.currentStock,
      ]);

      // Highlight top 3
      if (index < 3) {
        row.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFD700" },
        };
        row.getCell(1).font = { bold: true };
      }
    });

    return workbook;
  }

  /**
   * Xuất báo cáo ra PDF
   */
  static async exportToPDF(reportData, reportType) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(20).font("Helvetica-Bold").text(this.getReportTitle(reportType), {
        align: "center",
      });
      doc.moveDown();

      // Thông tin thời gian
      if (reportData.period) {
        doc.fontSize(10).font("Helvetica")
          .text(`Period: ${this.formatDate(reportData.period.startDate)} - ${this.formatDate(reportData.period.endDate)}`, {
            align: "center",
          });
        doc.moveDown();
      }

      // Summary section
      if (reportData.summary) {
        doc.fontSize(14).font("Helvetica-Bold").text("Summary", { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10).font("Helvetica");
        Object.entries(reportData.summary).forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").trim();
          const displayValue = typeof value === "number" && value > 1000 
            ? this.formatCurrency(value) 
            : value;
          doc.text(`${label}: ${displayValue}`);
        });
        doc.moveDown();
      }

      // Kết thúc PDF
      doc.end();
    });
  }

  /**
   * Xuất báo cáo ra Word
   */
  static async exportToWord(reportData, reportType) {
    const doc = new Document({
      sections: [
        {
          children: [
            // Tiêu đề
            new Paragraph({
              text: this.getReportTitle(reportType),
              heading: "Title",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),

            // Thời gian
            new Paragraph({
              text: `Thời gian: ${this.formatDate(reportData.period?.startDate)} - ${this.formatDate(reportData.period?.endDate)}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),

            // Summary
            new Paragraph({
              text: "TỔNG QUAN",
              heading: "Heading1",
            }),
            ...this.createSummaryParagraphs(reportData.summary),

            // Data table
            ...(await this.createDataTable(reportData, reportType)),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Helper: Tạo các paragraph cho summary
   */
  static createSummaryParagraphs(summary) {
    if (!summary) return [];

    return Object.entries(summary).map(
      ([key, value]) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${key}: `,
              bold: true,
            }),
            new TextRun({
              text: typeof value === "number" && value > 1000 
                ? this.formatCurrency(value) 
                : String(value),
            }),
          ],
        })
    );
  }

  /**
   * Helper: Tạo bảng dữ liệu cho Word
   */
  static async createDataTable(reportData, reportType) {
    const tables = [];

    if (reportType === "revenue" && reportData.dailyRevenue) {
      tables.push(new Paragraph({ text: "" }));
      tables.push(
        new Paragraph({
          text: "DOANH THU THEO NGÀY",
          heading: "Heading2",
        })
      );

      const rows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Ngày")] }),
            new TableCell({ children: [new Paragraph("Doanh thu")] }),
            new TableCell({ children: [new Paragraph("Số đơn")] }),
          ],
        }),
        ...reportData.dailyRevenue.slice(0, 20).map(
          (item) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(item.date)] }),
                new TableCell({ children: [new Paragraph(this.formatCurrency(item.revenue))] }),
                new TableCell({ children: [new Paragraph(String(item.orders))] }),
              ],
            })
        ),
      ];

      tables.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        })
      );
    }

    return tables;
  }

  /**
   * Helper: Lấy tiêu đề báo cáo
   */
  static getReportTitle(reportType) {
    const titles = {
      revenue: "BÁO CÁO DOANH THU",
      inventory: "BÁO CÁO TỒN KHO",
      "best-sellers": "BÁO CÁO SẢN PHẨM BÁN CHẠY",
      orders: "BÁO CÁO ĐỐN HÀNG",
      categories: "BÁO CÁO DANH MỤC",
      comprehensive: "BÁO CÁO TỔNG HỢP",
    };
    return titles[reportType] || "BÁO CÁO";
  }
}
