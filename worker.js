export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Music bot is running 🎵");
    }

    if (
      env.WEBHOOK_SECRET &&
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const update = await request.json();
    const botToken = env.BOT_TOKEN;

    if (!botToken) {
      return new Response("BOT_TOKEN is missing", { status: 500 });
    }

    const api = `https://api.telegram.org/bot${botToken}`;

    async function sendMessage(chatId, text, keyboard) {
      return fetch(`${api}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          reply_markup: keyboard
        })
      });
    }

    const menu = {
      keyboard: [
        [{ text: "🎼 Все жанры" }, { text: "🔎 Поиск" }],
        [{ text: "🔥 Популярное" }, { text: "🆕 Новинки" }],
        [{ text: "🎲 Случайная песня" }, { text: "❤️ Избранное" }],
        [{ text: "📂 Плейлисты" }, { text: "🎤 Мои аудио" }],
        [{ text: "✍️ Авторские песни" }, { text: "🌍 Музыка мира" }]
      ],
      resize_keyboard: true
    };

    const genres = {
      inline_keyboard: [
        [{ text: "🇷🇺 Русская музыка", callback_data: "ru" }],
        [{ text: "🎸 Рок и металл", callback_data: "rock" }],
        [{ text: "🎤 Поп", callback_data: "pop" }],
        [{ text: "🎧 Рэп и хип-хоп", callback_data: "rap" }],
        [{ text: "🎛️ Электронная", callback_data: "electro" }],
        [{ text: "🎷 Джаз, блюз, соул", callback_data: "jazz" }],
        [{ text: "🪗 Народная и этническая", callback_data: "folk" }],
        [{ text: "🤠 Кантри", callback_data: "country" }],
        [{ text: "🌴 Латино и регги", callback_data: "latin" }],
        [{ text: "🎹 Классика и инструментал", callback_data: "classic" }],
        [{ text: "🎬 Саундтреки", callback_data: "soundtracks" }],
        [{ text: "🌙 Релакс", callback_data: "relax" }],
        [{ text: "👶 Детская", callback_data: "kids" }],
        [{ text: "🎤 Караоке", callback_data: "karaoke" }],
        [{ text: "🔥 Ремиксы и TikTok", callback_data: "remix" }]
      ]
    };

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || "";

      if (text === "/start") {
        await sendMessage(
          chatId,
          "🎵 Добро пожаловать в «Музыка без границ»!\n\nВыбирай жанр, ищи музыку и собирай свои плейлисты.",
          menu
        );
      } else if (text === "🎼 Все жанры" || text === "🌍 Музыка мира") {
        await sendMessage(chatId, "🎶 Выбирай музыкальное направление:", genres);
      } else if (text === "🔎 Поиск") {
        await sendMessage(
          chatId,
          "🔎 Поиск песен пока готовится. Скоро можно будет искать по названию и исполнителю.",
          menu
        );
      } else {
        await sendMessage(
          chatId,
          "Пока каталог наполняется музыкой 🎧 Выбери раздел в меню.",
          menu
        );
      }
    }

    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;

      const names = {
        ru: "🇷🇺 Русская музыка",
        rock: "🎸 Рок и металл",
        pop: "🎤 Поп",
        rap: "🎧 Рэп и хип-хоп",
        electro: "🎛️ Электронная музыка",
        jazz: "🎷 Джаз, блюз и соул",
        folk: "🪗 Народная и этническая",
        country: "🤠 Кантри",
        latin: "🌴 Латино и регги",
        classic: "🎹 Классика и инструментал",
        soundtracks: "🎬 Саундтреки",
        relax: "🌙 Релакс",
        kids: "👶 Детская музыка",
        karaoke: "🎤 Караоке",
        remix: "🔥 Ремиксы и TikTok"
      };

      await fetch(`${api}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: query.id
        })
      });

      await sendMessage(
        chatId,
        `Выбран раздел: ${names[query.data] || "Музыка"} 🎵\n\nКаталог этого жанра будем наполнять дальше.`,
        menu
      );
    }

    return new Response("OK");
  }
};
