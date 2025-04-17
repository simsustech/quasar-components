<template>
  <q-table
    v-if="modelValue"
    v-model:pagination="tablePagination"
    :title="lang.account.title"
    class="full-width"
    :rows="modelValue"
    :columns="accountColumns"
    row-key="id"
    @request="onRequest"
  >
    <template #header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template #top-right>
      <q-btn :icon="searchIcon" flat>
        <q-menu>
          <div class="q-pa-sm">
            <q-input v-model="name" :label="lang.account.fields.name">
              <template #append>
                <q-icon
                  v-if="name"
                  class="q-field__focusable-action"
                  role="button"
                  :name="cancelIcon"
                  @click="name = ''"
                />
              </template>
            </q-input>
            <q-input v-model="email" :label="lang.account.fields.email">
              <template #append>
                <q-icon
                  v-if="email"
                  class="q-field__focusable-action"
                  role="button"
                  :name="cancelIcon"
                  @click="email = ''"
                />
              </template>
            </q-input>

            <q-select
              v-model="roles"
              multiple
              style="min-width: 200px"
              :label="lang.account.fields.roles"
              :options="roleOptions"
              map-options
              emit-value
            >
              <template #append>
                <q-icon
                  v-if="roles.length"
                  class="q-field__focusable-action"
                  role="button"
                  :name="cancelIcon"
                  @click="roles = []"
                />
              </template>
            </q-select>
          </div>
        </q-menu>
      </q-btn>
    </template>
    <template #body="props">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
        <q-td auto-width>
          <q-btn size="sm" round flat :icon="moreVertIcon">
            <q-menu>
              <q-list>
                <q-item clickable @click="openAddRoleDialog(props.row)">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.account.labels.addRole }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable @click="openRemoveRoleDialog(props.row)">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.account.labels.removeRole }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts" setup generic="T extends Account">
import { computed, ref, toRefs, watch } from 'vue'
import { QTable, QTableColumn, useQuasar } from 'quasar'
import { useLang } from './lang/index.js'

export interface Account {
  id: number
  name?: string
  email: string
  roles: string[]
}

export interface Pagination {
  limit: number
  offset: number
  sortBy: keyof Account
  descending: boolean
}

export interface Criteria {
  roles: string[]
}

const props = defineProps<{
  modelValue: T[]
  count: number
  pagination: Pagination
  mappedRoles: Record<string, string> // value: label
  columns?: QTableColumn[]
  icons?: {
    search: string
    cancel: string
    moreVert: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:pagination', pagination: Pagination): void
  (e: 'update:criteria', criteria: Criteria): void
  (e: 'addRole', { id, role }: { id: number; role: string }): void
  (e: 'removeRole', { id, role }: { id: number; role: string }): void
}>()

const { modelValue, count, mappedRoles, columns, icons } = toRefs(props)

// const { useQuery } = await createUseTrpc()
const lang = useLang()
const $q = useQuasar()

const sortBy = ref<keyof Account>(props.pagination.sortBy)
const descending = ref(props.pagination.descending)
const rowsPerPage = ref(props.pagination.limit)
const page = ref(props.pagination.offset / props.pagination.limit + 1)

const name = ref<string>('')
const email = ref<string>('')
const roles = ref<string[]>([])
const criteria = computed(() => ({
  name: name.value,
  email: email.value,
  roles: roles.value
}))

const tablePagination = computed({
  // getter
  get() {
    return {
      sortBy: sortBy.value,
      descending: descending.value,
      page: page.value,
      rowsPerPage: rowsPerPage.value,
      rowsNumber: count.value || 0
    }
  },
  // setter
  set(newValue) {
    sortBy.value = newValue.sortBy
    descending.value = newValue.descending
    page.value = newValue.page
    rowsPerPage.value = newValue.rowsPerPage
  }
})

watch(criteria, () => emit('update:criteria', criteria.value))

const onRequest: QTable['$props']['onRequest'] = ({ pagination }) => {
  descending.value = pagination.descending
  sortBy.value = pagination.sortBy as keyof Account
  page.value = pagination.page
  rowsPerPage.value = pagination.rowsPerPage

  emit('update:pagination', {
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value as keyof Account,
    descending: descending.value
  })
  return
}

const accountColumns = ref<QTableColumn[]>([
  {
    name: 'id',
    required: true,
    label: '#',
    align: 'left',
    field: (row) => row.id,
    format: (val) => `${val}`,
    sortable: true
  },
  {
    name: 'name',
    required: true,
    label: lang.value.account.fields.name,
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val || ''}`,
    sortable: false
  },
  {
    name: 'email',
    required: true,
    label: lang.value.account.fields.email,
    align: 'left',
    field: (row) => row.email,
    format: (val) => `${val}`,
    sortable: false
  },
  {
    name: 'roles',
    required: true,
    label: lang.value.account.fields.roles,
    align: 'right',
    field: (row) => row.roles,
    format: (val) =>
      val.map((role: string) => mappedRoles.value[role]).join(', ')
  }
])

if (columns?.value) accountColumns.value.push(...columns.value)

const roleOptions = computed(() =>
  Object.entries(mappedRoles.value).map(([key, value]) => ({
    label: value,
    value: key
  }))
)

const openAddRoleDialog = (account: Account) => {
  $q.dialog({
    message: lang.value.account.messages.addRole(account),
    options: {
      type: 'radio',
      model: 'role',
      items: roleOptions.value.filter(
        (newRole) => !account.roles.includes(newRole.value)
      )
    },
    cancel: true,
    persistent: true
  }).onOk((role: string) => {
    emit('addRole', { id: account.id, role })
  })
}

const openRemoveRoleDialog = (account: Account) => {
  $q.dialog({
    message: lang.value.account.messages.removeRole(account),
    options: {
      type: 'radio',
      model: 'role',
      items: account.roles?.map((role) => ({
        label: mappedRoles.value[role],
        value: role
      }))
    },
    cancel: true,
    persistent: true
  }).onOk((role) => {
    emit('removeRole', { id: account.id, role })
  })
}

const searchIcon = icons.value?.search ?? 'search'
const cancelIcon = icons.value?.cancel ?? 'cancel'
const moreVertIcon = icons.value?.moreVert ?? 'more_vert'
</script>
