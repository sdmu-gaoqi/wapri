import ProTableComp from './index.vue'
import ProTablePagination from './components/ProTablePagination.vue'
import ProTableSearchForm from './components/ProTableSearchForm.vue'
import ProTableSelectedFilters from './components/ProTableSelectedFilters.vue'
import ProTableSelectionActions from './components/ProTableSelectionActions.vue'
import ProTableToolbar from './components/ProTableToolbar.vue'
import { withInstall } from '../utils/install'

export const ProTable = withInstall(ProTableComp, {
  ProTablePagination,
  ProTableSearchForm,
  ProTableSelectedFilters,
  ProTableSelectionActions,
  ProTableToolbar,
})

export * from './types'
export * from './utils'

export default ProTable
