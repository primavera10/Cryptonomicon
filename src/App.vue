<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <div class="container">
      <AddTicker />
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
              'bg-white': !t.invalid,
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
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
      <hr class="border-t border-gray-600 my-4" />
      <PriceGraph
        v-if="selectedTicker"
        :selected-ticker="selectedTicker"
        :graph="graph"
        @close="selectedTicker = null"
        @update-graph="graph.shift()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import AddTicker from "@/components/AddTicker.vue";
import { useTickersStore } from "@/store/tickers";
import type { Ticker } from "@/store/tickers";
import PriceGraph from "@/components/PriceGraph.vue";

const store = useTickersStore();

const filter = ref<string>("");

const selectedTicker = ref<any>(null);
const tickers = computed(() => store.tickers);

const graph = ref<number[]>([]); //+

const page = ref<number>(1);

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

function handleDelete(tickerToRemove: Ticker) {
  store.remove(tickerToRemove.name);
  if (tickerToRemove === selectedTicker.value) {
    selectedTicker.value = null;
  }
}

function select(ticker: any) {
  selectedTicker.value = ticker;
}

onMounted(async () => {
  await store.loadAvailableTickers();
});

const tickersData = localStorage.getItem("cryptonomicon-list");

// так как следующие строки внутри сетап функции, они работают как хук жизненного цикла created

store.getFromLocalStorage(tickersData);

const windowData = Object.fromEntries(
  new URL(window.location).searchParams.entries()
); // записываем данные в адресную строку
if (windowData.filter) {
  filter.value = windowData.filter; // грузит данные из урла и достает фильтр
}
if (windowData.page) {
  page.value = windowData.page; // грузит данные из урла и достает страницу
}

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
  graph.value = [];
});

watch(
  selectedTicker,
  async () => {
    // при изменении selectedTicker очисти значение graph
    if (!selectedTicker.value) {
      return;
    }
    graph.value.push(selectedTicker.value.price);
    // ждем пока все изменения применятся и только тогда меняем кол-во элементов в графике при изменении рефа выбранного тикера
    await nextTick();
  },
  { deep: true }
);

watch(
  tickers,
  (newTickers) => {
    localStorage.setItem("cryptonomicon-list", JSON.stringify(newTickers));
  },
  { deep: true }
);
</script>

<style src="./app.css"></style>
