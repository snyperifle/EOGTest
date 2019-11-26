import { createSlice, PayloadAction } from 'redux-starter-kit'

export type ApiErrorAction = {
  error: string;
}

export type MetricsSelection = {
  title: string,
  color: string,
}

const initialState = {
  selections: [
    { title: 'injValveOpen', color: '#56ff00' },
    { title: 'oilTemp', color: '#ff8d00' },
    { title: 'tubingPressure', color: '#00f9ff' },
    { title: 'flareTemp', color: '#E14343' },
    { title: 'casingPressure', color: '#fd00ff' },
    { title: 'waterTemp', color: '#0004FF' },
  ],
  selected: [],
}

const slice = createSlice({
  name: 'selected',
  initialState,
  reducers: {
    updateSelected: (state, action) => {
      state.selected = action.payload
      // console.log(state.selected);
    },
    metricsApiErrorAction: (state, action: PayloadAction<ApiErrorAction>) => state,
  }
})

export const reducer = slice.reducer;
export const actions = slice.actions;