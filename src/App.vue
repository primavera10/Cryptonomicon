<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700">
              Тикер {{ ticker }}
            </label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                type="text"
                name="wallet"
                id="wallet"
                @keydown.enter="checkTicker"
                v-model="ticker"
                class="block w-full pr-10 border-gray-300 mb-1 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                v-for="(a, idx) in autocomplete"
                :key="idx"
                @click="addAutocompletedTicker(a)"
              >
                {{ a }}
              </span>
            </div>
            <div v-if="existedTicker" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          type="button"
          @click="checkTicker(ticker)"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>
      <template v-if="tickers.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="my-2">
          <button
            @click="page -= 1"
            v-if="page > 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            @click="page += 1"
            v-if="hasNextPage"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
          <div>
            Фильтр:
            <input v-model="filter" />
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-100': t.invalid,
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            @click="select(t)"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
      </template>
      <hr class="w-full border-t border-gray-600 my-4" />
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { subscribeToTicker, unsubscribeFromTicker } from "./api";
import type { Ref } from "vue"; // нужно чтобы сборщик понимал что это не жс, а именно ТС

interface Ticker {
  name: string;
  price: string | number;
  invalid?: boolean;
}

const ticker = ref("");
const filter = ref<string>("");

const selectedTicker = ref<any>(null);
const tickers = ref<Ticker[]>([]);

const graph = ref<number[]>([]);

const arrayNames = ref<String[]>([]);

const page = ref<number>(1);

const existedTicker = computed(
  () =>
    !!tickers.value.find(
      (t) => t.name.toLowerCase() === ticker.value.toLowerCase()
    )
);

function formatPrice(p: Ticker["price"]) {
  if (typeof p === "string") {
    return "-";
  }
  if (p > 1) {
    return p.toFixed(2);
  } else {
    return p.toPrecision(2);
  }
}

function add(tickerName?: string) {
  if (tickerName) {
    const currentTicker: Ticker = { name: tickerName || ticker.value, price: "-" };
    tickers.value = [...tickers.value, currentTicker];
    ticker.value = "";
    filter.value = "";
    subscribeToTicker(currentTicker.name, (newPrice?: number) => {
      if (!newPrice) {
        currentTicker.invalid = true;
      } else {
        updateTicker(currentTicker.name, newPrice);
      }
    });
  }
}

function checkTicker() {
  if (!existedTicker.value) {
    add();
  }
}

function handleDelete(tickerToRemove: Ticker) {
  tickers.value = tickers.value.filter((t) => t !== tickerToRemove);
  if (selectedTicker.value === tickerToRemove) {
    selectedTicker.value = null;
  }
  unsubscribeFromTicker(tickerToRemove.name);
}

function select(ticker: any) {
  selectedTicker.value = ticker;
}

onMounted(async () => {
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
  );
  const result = await response.json();
  arrayNames.value.push(...Object.keys(result.Data));
});

const autocomplete = computed(() => {
  if (!ticker.value) {
    return ["BTC", "DOGE", "ETH", "XDP"];
  } else {
    let a = arrayNames.value.filter((name) =>
      name.toLowerCase().startsWith(ticker.value.toLowerCase())
    );
    return a.slice(0, 4);
  }
});

function addAutocompletedTicker(a: string) {
  if (!tickers.value.find((b) => b.name === a)) {
    add(a);
  }
}

const tickersData = localStorage.getItem("cryptonomicon-list");

// так как следующие строки внутри сетап функции, они работают как хук жизненного цикла created

if (tickersData) {
  tickers.value = JSON.parse(tickersData);
  tickers.value.forEach((ticker) => {
    subscribeToTicker(ticker.name, (newPrice?: number) => {
      if (!newPrice) {
        ticker.invalid = true;
      } else {
        updateTicker(ticker.name, newPrice);
      }
    });
  });
  setInterval(updateTicker, 5000);
}


const windowData = Object.fromEntries(
  new URL(window.location).searchParams.entries()
); // записываем данные в адресную строку
if (windowData.filter) {
  filter.value = windowData.filter; // грузит данные из урла и достает фильтр
}
if (windowData.page) {
  page.value = windowData.page; // грузит данные из урла и достает страницу
}
//
// computed starts here
const normalizedGraph = computed(() => {
  const maxValue = Math.max(...graph.value);
  const minValue = Math.min(...graph.value);
  if (maxValue === minValue) {
    return graph.value.map(() => 50);
  }

  return graph.value.map(
    (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue) // функция возвращает процент текущей цены от максимальной
  );
});

const startIndex = computed(() => {
  return (page.value - 1) * 6;
});
const endIndex = computed(() => {
  return page.value * 6;
});

const filteredTickers = computed(() => {
  return tickers.value.filter((t) =>
    t.name.toLowerCase().startsWith(filter.value.toLowerCase())
  );
});
const paginatedTickers = computed(() => {
  return filteredTickers.value.slice(startIndex.value, endIndex.value);
});

const hasNextPage = computed(() => {
  return filteredTickers.value.length > endIndex.value;
});

// end

watch([filter, page], ([appliedFilters, newPage], [oldFilters]) => {
  const p = oldFilters !== appliedFilters ? 1 : newPage;
  window.history.pushState(
    null,
    document.title,
    `${window.location.pathname}?filter=${appliedFilters}&page=${p}`
  ); // при введении чего либо в фильтр УРЛ запоминает значение фильтра и  страницу
});

watch(paginatedTickers, () => {
  if (paginatedTickers.value.length === 0 && page.value > 1) {
    page.value -= 1;
  }
});

watch(selectedTicker, () => {
  // при изменении selectedTicker очисти значение graph
  graph.value = [];
});

watch(tickers, (oldValue, newValue) => {
  localStorage.setItem("cryptonomicon-list", JSON.stringify(tickers.value));
});

function updateTicker(tickerName: string, price: number) {
  tickers.value
    .filter((t => t.name === tickerName))
    .forEach(t => {
      if (t === selectedTicker.value) {
        graph.value.push(price);
      }
      t.price = price;
    });
}
</script>

<style src="./app.css"></style>
