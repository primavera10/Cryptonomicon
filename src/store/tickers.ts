import { defineStore } from "pinia";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api";

 export interface Ticker {
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
    update(name: string, price?: Ticker["price"]) {
      if (price === undefined) {
        this.tickers.find((t) => t.name === name)!.invalid = true;
        return;
      }
      this.tickers.find((t) => t.name === name)!.price = price;
    },
    add(name: string) {
      const currentTicker: Ticker = {
        name,
        price: "-",
        invalid: false,
      };
      if (currentTicker.name.length === 0){
        return;
      }
      this.tickers.push(currentTicker);

      subscribeToTicker(currentTicker.name, (newPrice?: number) => {
          this.update(name, newPrice);
      });
    },
    tickerExists(name: string): boolean {
      return !!this.tickers.find(
        (ticker) => ticker.name.toLowerCase() === name.toLowerCase()
      );
    },
    getFromLocalStorage(data: string | null) {
      if (!data) {
        return;
      }
      this.tickers = JSON.parse(data);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice?: number) => {
          this.update(ticker.name, newPrice);
        });
      });
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
