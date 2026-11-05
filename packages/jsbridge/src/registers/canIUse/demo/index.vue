<script lang="tsx">
import { defineComponent, ref } from 'vue'
import { jsbridge } from '@wapri/gjsbridge'

export default defineComponent({
  setup(props) {
    const result = ref('')
    const errors = ref('')
    const handleClick = () => {
      jsbridge
        .canIUse({ api: 'debug.demp' })
        .then((res) => {
          result.value = JSON.stringify(res)
        })
        .catch((error) => {
          errors.value = error.message
        })
    }
    return () => {
      return (
        <div>
          <div>
            <strong>result:</strong>
            {result.value}
          </div>
          <div>
            <strong>error:</strong>
            {errors.value}
          </div>
          <button onClick={handleClick}>点击</button>
        </div>
      )
    }
  },
})
</script>
