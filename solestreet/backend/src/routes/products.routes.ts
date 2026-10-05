import { Router, Request, Response } from "express";
import { StoreService } from "../services/store.service.js";
import { ShoeCategory, ShoeGender, SortOption, ShoeSize } from "../types/index.js";

const router = Router();

// GET /api/products
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, gender, brand, minPrice, maxPrice, sizes, sort, search } = req.query;

    const parsedSizes = sizes
      ? (Array.isArray(sizes) ? sizes : [sizes]).map((s) => parseFloat(String(s)) as ShoeSize)
      : undefined;

    const products = await StoreService.getProducts(
      {
        category: category as ShoeCategory | undefined,
        gender: gender as ShoeGender | undefined,
        brand: brand ? String(brand) : undefined,
        minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        sizes: parsedSizes,
        search: search ? String(search) : undefined,
      },
      sort as SortOption | undefined
    );

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving products";
    res.status(500).json({ error: message });
  }
});

// GET /api/products/:identifier (id or slug)
router.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const identifier = Array.isArray(req.params.identifier) ? req.params.identifier[0] : req.params.identifier;
    const product = await StoreService.getProductByIdOrSlug(identifier);

    if (!product) {
      res.status(404).json({ error: `Product '${identifier}' not found` });
      return;
    }

    res.json({ success: true, product });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving product";
    res.status(500).json({ error: message });
  }
});

// POST /api/products (Admin create)
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.price || !data.category) {
      res.status(400).json({ error: "Missing required fields: name, price, category" });
      return;
    }
    const created = await StoreService.createProduct(data);
    res.status(201).json({ success: true, product: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    res.status(500).json({ error: message });
  }
});

// PUT /api/products/:id (Admin update)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await StoreService.updateProduct(id, req.body);

    if (!updated) {
      res.status(404).json({ error: `Product with ID '${id}' not found` });
      return;
    }

    res.json({ success: true, product: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    res.status(500).json({ error: message });
  }
});

// DELETE /api/products/:id (Admin delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await StoreService.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({ error: `Product with ID '${id}' not found` });
      return;
    }

    res.json({ success: true, message: `Product '${id}' deleted successfully` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    res.status(500).json({ error: message });
  }
});

export default router;
