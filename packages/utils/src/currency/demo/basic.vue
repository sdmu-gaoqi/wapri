<script setup lang="ts">
import { computed, ref } from 'vue'
import { currency } from '@wapri/gutils'

const amountInput = ref('1234.56')
const centsInput = ref('123456')
const symbol = ref('¥')
const precision = ref(2)

function toFiniteNumber(value: string): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const amountValue = computed(() => toFiniteNumber(amountInput.value))
const amount = computed(() => currency(amountValue.value, { symbol: symbol.value, precision: precision.value }))
const centsValue = computed(() => amount.value.intValue)
const restoredAmount = computed(() =>
  currency(centsValue.value, {
    fromCents: true,
    symbol: symbol.value,
    precision: precision.value,
  }).format(),
)
const centsAmount = computed(() =>
  currency(toFiniteNumber(centsInput.value), {
    fromCents: true,
    symbol: symbol.value,
    precision: precision.value,
  }),
)
const plusAmount = computed(() => amount.value.add('99.90').format())
const splitAmounts = computed(() =>
  amount.value
    .distribute(3)
    .map((item) => item.format())
    .join('、'),
)
</script>

<template>
  <div class="currency-demo">
    <div class="currency-demo__fields">
      <label class="currency-demo__field">
        <span>输入金额（元）</span>
        <input
          v-model="amountInput"
          type="number"
          step="0.01"
          inputmode="decimal"
        />
      </label>
      <label class="currency-demo__field">
        <span>货币符号</span>
        <input
          v-model="symbol"
          maxlength="3"
        />
      </label>
      <label class="currency-demo__field">
        <span>小数位数</span>
        <select v-model.number="precision">
          <option :value="0">0</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </label>
    </div>

    <div class="currency-demo__result">
      <p>
        格式化展示：
        <strong>{{ amount.format() }}</strong>
      </p>
      <p>
        元金额数值：
        <code>{{ amount.value }}</code>
      </p>
      <p>
        转换为最小货币单位：
        <code>{{ centsValue }}</code>
      </p>
      <p>
        从最小货币单位还原：
        <strong>{{ restoredAmount }}</strong>
      </p>
      <p>
        加上 99.90：
        <strong>{{ plusAmount }}</strong>
      </p>
      <p>
        平均分成 3 份：
        <strong>{{ splitAmounts }}</strong>
      </p>
    </div>

    <label class="currency-demo__field currency-demo__field--cents">
      <span>输入最小货币单位（分）</span>
      <input
        v-model="centsInput"
        type="number"
        step="1"
        inputmode="numeric"
      />
      <strong>{{ centsAmount.format() }}</strong>
    </label>
  </div>
</template>

<style scoped>
.currency-demo {
  max-width: 760px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #1f2937;
}

.currency-demo__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.currency-demo__field {
  display: inline-flex;
  min-width: 150px;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.currency-demo__field input,
.currency-demo__field select {
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: inherit;
  font: inherit;
}

.currency-demo__result {
  margin: 20px 0;
  padding: 14px 16px;
  border-radius: 6px;
  background: #f8fafc;
  line-height: 1.8;
}

.currency-demo__result p {
  margin: 0;
}

.currency-demo__result strong,
.currency-demo__field strong {
  color: #1677ff;
}

.currency-demo__field--cents {
  max-width: 300px;
}

code {
  padding: 2px 5px;
  border-radius: 3px;
  background: #eef2f7;
}
</style>
