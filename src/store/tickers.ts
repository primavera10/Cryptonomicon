import { defineStore } from "pinia";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api";
interface Ticker {
  name: string;
  price: string | number;
  invalid?: boolean;
}

export const useTickersStore = defineStore("tickers", {
  state: () => ({
    tickers: [] as Array<Ticker>, // сказать ts что массив может содержать что-то (Тикеры)
    allTickers: [] as Array<string>,
  }),
  actions: {
    async loadAvailableTickers() {
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
      );
      const result = await response.json();
      this.allTickers.push(...Object.keys(result.Data));
    },
    remove(name: string) {
      this.tickers = this.tickers.filter((t) => t.name !== name);
      unsubscribeFromTicker(name);
    },
    update(name: string, price: Ticker["price"]) {
      this.tickers.find((t) => t.name === name)!.price = price;
    },
    add(name: string) {
      const currentTicker: Ticker = {
        name,
        price: "-",
        invalid: false,
      };

      this.tickers.push(currentTicker);

      subscribeToTicker(currentTicker.name, (newPrice?: number) => {
        if (!newPrice) {
          currentTicker.invalid = true;
        } else {
          this.update(name, newPrice);
        }
      });
    },
    tickerExists(name: string): boolean {
      return !!this.tickers.find(
        (ticker) => ticker.name.toLowerCase() === name.toLowerCase()
      );
    },
  },
  getters: {
    availableTickers(state): string[] {
      return state.allTickers.filter((name) => {
        const found = state.tickers.find((ticker) => ticker.name === name);
        return !found;
      });
    },
  },
});
