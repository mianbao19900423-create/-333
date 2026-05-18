export async function onRequestPost(context) {

  try {

    const db = context.env.DB;

    const body = await context.request.json();

    console.log(JSON.stringify(body));

    // 只处理支付完成
    if (
      body.event !== "payment.completed" &&
      body.event !== "checkout.completed"
    ) {

      return Response.json({
        ignored: true
      });

    }

    // 防止重复插入
    const orderId =
      body.data?.id ||
      body.data?.payment_id ||
      crypto.randomUUID();

    // 邮箱
    const email =
      body.data?.customer_email ||
      body.data?.customer?.email ||
      "unknown";

    // 金额（兼容多种字段）
    let amount =
      body.data?.amount ||
      body.data?.total ||
      body.data?.price ||
      body.amount ||
      0;

    // 如果是 cents → 转美元
    if (amount > 1000) {
      amount = amount / 100;
    }

    // 先检查是否已存在
    const existing = await db
      .prepare(`
        SELECT id FROM payments
        WHERE status = ?
        LIMIT 1
      `)
      .bind(orderId)
      .first();

    if (existing) {

      return Response.json({
        duplicate: true
      });

    }

    // 写入数据库
    await db
      .prepare(`
        INSERT INTO payments
        (email, amount, status)
        VALUES (?, ?, ?)
      `)
      .bind(
        email,
        amount,
        orderId
      )
      .run();

    return Response.json({
      success: true
    });

  } catch (err) {

    return Response.json({
      error: err.message
    });

  }

}
