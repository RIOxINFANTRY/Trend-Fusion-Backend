"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { products } = ctx.request.body;
    try {
      // Process the products without Stripe
      const processedProducts = await Promise.all(
        products.map(async (product) => {
          const item = await strapi
            .service("api::product.product")
            .findOne(product.id);
          
          return {
            product: item.title,
            price: item.price,
            quantity: product.attributes.quantity,
          };
        })
      );

      // Create the order in Strapi without the Stripe session
      const order = await strapi
        .service("api::order.order")
        .create({ data: { products: processedProducts } });

      return { order };
    } catch (error) {
      ctx.response.status = 500;
      return { error };
    }
  },
}));
