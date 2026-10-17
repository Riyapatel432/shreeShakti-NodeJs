const QuotationModel = require("../../models/quotation/Quotation.model");
const CostingSheetModel = require("../../models/costingSheet/CostingSheet.model");
const PriceProductModel = require("../../models/Price/Price.model");
const puppeteer = require("puppeteer");

// ======================================================
// @desc    Get All Quotations
// @route   GET /api/Quotation/get-Quotation-details
// @access  Private
// ======================================================
exports.getQuotationDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const clientId = req.query.clientId?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };
    
    if (clientId) {
      filter.client = clientId;
    }

    if (search) {
      filter.quotation_no = {
        $regex: search,
        $options: "i",
      };
    }

    const totalRecords = await QuotationModel.countDocuments(filter);

    const quotations = await QuotationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("client", "name")
      .populate("product", "name")
      .populate("product_category", "name")
      .populate("sourceRateId", "current_price")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: quotations,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get Quotations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create Quotation
// @route   POST /api/Quotation/manage-Quotation-details
// @access  Private
// ======================================================
exports.manageQuotationDetails = async (req, res) => {
  try {
    const {
      quotation_no,
      client,
      product,
      product_category,
      sourceRateId,
      costingSheet,
      techSpec,
      snapshot,
      tax,
      tax_type,
      discount,
      grand_total,
      status,
    } = req.body;

    if (!quotation_no || !client) {
      return res.status(400).json({
        success: false,
        message: "Quotation number and client are required",
      });
    }

    let finalSnapshot = snapshot;
    let finalGrandTotal = grand_total;
    let snapRate = null;
    let snapQty = req.body.qty || 1;
    let snapMocName = null;
    let finalProduct = product;
    let finalProductCategory = product_category;

    if (costingSheet) {
      const sheet = await CostingSheetModel.findById(costingSheet)
        .populate("product")
        .populate("product_category")
        .populate("moc");

      if (sheet) {
        if (!finalProduct && sheet.product) {
          finalProduct = sheet.product._id;
        }
        if (!finalProductCategory && sheet.product_category) {
          finalProductCategory = sheet.product_category._id;
        }

        const itemName = sheet.product?.name || sheet.product_category?.name || "Costing Sheet Item";
        const itemMoc = sheet.moc?.name || "";
        const itemDesc = itemMoc ? `${itemName} (${itemMoc})` : itemName;
        const itemAmount = sheet.amount || (sheet.qty * sheet.rate) || sheet.total || sheet.grandTotal || 0;

        finalSnapshot = {
          items: [
            {
              description: itemDesc,
              qty: sheet.qty || 1,
              rate: sheet.rate || itemAmount,
              amount: itemAmount,
            }
          ],
          subtotal: itemAmount,
          grand_total: itemAmount
        };

        if (!finalGrandTotal) {
          finalGrandTotal = itemAmount;
        }
      }
    } else if (sourceRateId) {
      const priceDoc = await PriceProductModel.findById(sourceRateId).populate("moc", "name");
      if (priceDoc) {
        snapRate = priceDoc.current_price;
        snapMocName = priceDoc.moc?.name || "Standard MOC";
        if (!finalSnapshot || !finalSnapshot.items || finalSnapshot.items.length === 0) {
           finalSnapshot = {
             items: [{
               description: snapMocName,
               qty: snapQty,
               rate: snapRate,
               amount: snapQty * snapRate
             }],
             subtotal: snapQty * snapRate,
             grand_total: finalGrandTotal || (snapQty * snapRate)
           };
        }
      }
    }

    const existingQuotation = await QuotationModel.findOne({
      quotation_no,
      isDeleted: false,
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: "Quotation number already exists",
      });
    }

    const quotation = await QuotationModel.create({
      quotation_no,
      client,
      product: finalProduct || null,
      product_category: finalProductCategory || null,
      sourceRateId,
      costingSheet,
      techSpec,
      snapshot: finalSnapshot,
      tax,
      tax_type,
      discount,
      grand_total: finalGrandTotal,
      qty: snapQty,
      snapshottedRate: snapRate,
      snapshottedQty: snapQty,
      snapshottedMocName: snapMocName,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Create Quotation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create quotation",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Quotation
// @route   PUT /api/Quotation/update-Quotation-details/:id
// @access  Private
// ======================================================
exports.updateQuotationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    if (req.body.quotation_no) {
      const exists = await QuotationModel.findOne({
        quotation_no: req.body.quotation_no,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Quotation number already exists",
        });
      }
    }

    let updateData = { ...req.body, updatedBy: req.admin?._id || req.user?._id };
    
    if (req.body.sourceRateId && !req.body.costingSheet && (!quotation.snapshottedRate || req.body.sourceRateId !== quotation.sourceRateId?.toString())) {
      const priceDoc = await PriceProductModel.findById(req.body.sourceRateId).populate("moc", "name");
      if (priceDoc) {
        updateData.snapshottedRate = priceDoc.current_price;
        updateData.snapshottedMocName = priceDoc.moc?.name || "Standard MOC";
        updateData.snapshottedQty = req.body.qty || quotation.qty || 1;
        
        if (!req.body.snapshot || !req.body.snapshot.items || req.body.snapshot.items.length === 0) {
           updateData.snapshot = {
             items: [{
               description: updateData.snapshottedMocName,
               qty: updateData.snapshottedQty,
               rate: updateData.snapshottedRate,
               amount: updateData.snapshottedQty * updateData.snapshottedRate
             }],
             subtotal: updateData.snapshottedQty * updateData.snapshottedRate,
             grand_total: req.body.grand_total || (updateData.snapshottedQty * updateData.snapshottedRate)
           };
        }
      }
    }

    const updatedQuotation = await QuotationModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: updatedQuotation,
    });
  } catch (error) {
    console.error("Update Quotation Error:", error);

    if (error.name === "ValidationError") {
      const firstField = Object.keys(error.errors)[0];

      return res.status(400).json({
        success: false,
        field: firstField,
        message: error.errors[firstField]?.message,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return res.status(400).json({
        success: false,
        field,
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete Quotation
// @route   DELETE /api/Quotation/delete-Quotation-details/:id
// @access  Private
// ======================================================
exports.deleteQuotationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    await QuotationModel.findByIdAndUpdate(id, { isDeleted: true });

    return res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Quotation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Export Quotation PDF
// @route   GET /api/Quotation/export-pdf/:id
// @access  Private
// ======================================================
exports.exportQuotationPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await QuotationModel.findById(id)
      .populate("client", "name company_name email phone address city state gst_no")
      .populate("product", "name")
      .populate("techSpec");

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    // Generate HTML for PDF
    const client = quotation.client;
    const snap = quotation.snapshot;
    
    let itemsHtml = "";
    if (snap && snap.items && snap.items.length > 0) {
      snap.items.forEach(item => {
        itemsHtml += `<tr>
          <td>${item.description}</td>
          <td>${item.qty}</td>
          <td>${item.rate}</td>
          <td>${item.amount}</td>
        </tr>`;
      });
    } else if (quotation.snapshottedRate) {
      itemsHtml += `<tr>
        <td>${quotation.snapshottedMocName || "Product"}</td>
        <td>${quotation.snapshottedQty || quotation.qty || 1}</td>
        <td>${quotation.snapshottedRate}</td>
        <td>${(quotation.snapshottedQty || quotation.qty || 1) * quotation.snapshottedRate}</td>
      </tr>`;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #0056b3; }
            .header { border-bottom: 2px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .totals { text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quotation #${quotation.quotation_no}</h1>
            <p>Date: ${new Date(quotation.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="details">
            <h3>Bill To:</h3>
            <p><strong>${client?.company_name || 'N/A'}</strong><br/>
            ${client?.name || ''}<br/>
            ${client?.address || ''}, ${client?.city || ''}<br/>
            GST: ${client?.gst_no || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            ${snap?.subtotal ? `<p>Subtotal: ₹${snap.subtotal}</p>` : ''}
            <p><strong>Grand Total: ₹${quotation.grand_total}</strong></p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Quotation_${quotation.quotation_no}.pdf"`
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Export PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
};