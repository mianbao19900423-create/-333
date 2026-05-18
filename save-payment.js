export async function onRequestPost(context) {

  try {

    const db = context.env.DB;

    const body = await context.request.json();

    const {
      email,
      amount,
      status
    } = body;

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