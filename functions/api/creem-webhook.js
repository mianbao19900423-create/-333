export async function onRequestPost(context) {

  try {

    const db = context.env.DB;

    const body = await context.request.json();

    console.log(body);

    // 只记录支付成功事件
    if (body.event !== "payment.completed") {

      return Response.json({
        ignored: true
      });

    }

    // 提取真实数据
    const email =
      body.data?.customer_email || "unknown";

    const amount =
      body.data?.amount || 0;

    const status =
      "paid";

    await db
      .prepare(`
        INSERT INTO payments
        (email, amount, status)
        VALUES (?, ?, ?)
      `)
      .bind(
        email,
        amount,
        status
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
