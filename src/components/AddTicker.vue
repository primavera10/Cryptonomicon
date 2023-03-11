<template>
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
            @keydown.enter="add"
            v-model="ticker"
            class="block w-full pr-10 border-gray-300 mb-1 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
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
    <add-button
      :disabled="disabled"
      @click="add"
    />
  </section>
</template>

<script setup lang="ts">
import AddButton from "@/components/AddButton.vue";
import { computed, ref } from "vue";
import { subscribeToTicker } from "@/api";

import { useTickersStore } from "@/store/tickers";

const store = useTickersStore();

const props = defineProps({
  disabled :{
    type: Boolean,
    required: false,
    default: false,
  },
});



const ticker = ref("");
const existedTicker = computed(() => store.tickerExists(ticker.value));
function add() {
  if (!existedTicker.value) {
    store.add(ticker.value);
    ticker.value = "";
  }
}

const autocomplete = computed(() => {
  if (!ticker.value) {
    return ["BTC", "DOGE", "ETH", "XDP"];
  } else {
    let a = store.availableTickers.filter((name) =>
      name.toLowerCase().startsWith(ticker.value.toLowerCase())
    );
    return a.slice(0, 4);
  }
});
function addAutocompletedTicker(a: string) {
  if (!store.tickerExists(a)) {
    store.add(a);
  }
}

</script>

<style scoped></style>
