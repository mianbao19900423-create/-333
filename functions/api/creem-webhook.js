export async function onRequestPost(context) {

  try {

    const db = context.env.DB;

    const body = await context.request.json();

    console.log(body);

    const email =
      body.customer?.email || "unknown";

    const amount =
      body.amount || "0";

    const status =
      body.status || "paid";

    await db
      .prepare(
        `
        INSERT INTO payments
        (email, amount, status)
        VALUES (?, ?, ?)
        `
      )
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
