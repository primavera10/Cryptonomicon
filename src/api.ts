
const API_KEY =
  "4c8e128728db69b5bfd066999a31b40934ab3704b0a1f37f038eb43b9d673fc7";
const AGGREGATE_INDEX = "5";
type Callback = (newPrice?: number) => void;
const tickersHandlers = new Map<string, Callback[]>();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const bc = new BroadcastChannel("broadcast-info");

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: parameter,
  } = JSON.parse(e.data);
  if (message === "INVALID_SUB") {
    const handlers = tickersHandlers.get(parameter.match(/([A-Z0-9]+)~USD/)[1]) ?? [];
    handlers.forEach((handler) => handler());
    return;
  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? []; // мы достали из мапы все валюты по этому названию
  // и потом их вызвали
  handlers.forEach((handler) => handler(newPrice));
});

//TO DO - refactor to use URLSearchParams


function sendToWebSocket(message: object) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWsToBTC(t:string){
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${t}~BTC`],
  });
}

function subscribeToTickersOnWs(t: string) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${t}~USD`],
  });
}

function unSubscribeFromTickersOnWs(t: string) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${t}~USD`],
  });
}

export const subscribeToTicker = (ticker: string, cb: Callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickersOnWs(ticker);
};
export const unsubscribeFromTicker = (ticker: string) => {
  tickersHandlers.delete(ticker);
  unSubscribeFromTickersOnWs(ticker);
};

// с точки зрения бизнеса нам нужно получать ОБНОВЛЕНИЯ стоимости криптовалютных пар
