import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { actions } from '../Features/MetricsGraph/reducer';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Provider, createClient, useQuery } from 'urql';
//--------------------------------------------------------------------
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
//-------------------------------------------------------------------- selections
const selections = [
  { title: 'injValveOpen', color: '#56ff00' },
  { title: 'oilTemp', color: '#ff8d00' },
  { title: 'tubingPressure', color: '#00f9ff' },
  { title: 'flareTemp', color: '#E14343' },
  { title: 'casingPressure', color: '#fd00ff' },
  { title: 'waterTemp', color: '#0004FF' },
]

const lineColor: { [key:string]: string} = {
  'injValveOpen': '#56ff00',
  'oilTemp': '#ff8d00',
  'tubingPressure': '#00f9ff',
  'flareTemp': '#E14343',
  'casingPressure': '#fd00ff',
  'waterTemp': '#0004FF',
}
//--------------------------------------------------------------------
export type selection = { title: string }
//--------------------------------------------------------------------
const Metrics = () => {
  const dispatch = useDispatch();
  let [selected, setSelected] = useState([] as string[])
  let [graphData, setGraphData] = useState([])
  //--------------------------------------------------------------------
  const handleChangeSelected = (_event: React.ChangeEvent<{}>, values: selection[]) => {
    setSelected(selected = values.map((value) => value.title))
    dispatch(actions.updateSelected(selected))
  }
  //--------------------------------------------------------------------
  // const currentTime = Date.now();
  const thirtyMinsAgo = Date.now() - 1800000;
  // const thirtyMinsAgo = 1574738324866;
  //--------------------------------------------------------------------
  const query =
    `query Test{
      getMultipleMeasurements(input: 
        [
          ${selected.map(item => (
      '{' +
      'metricName:"' + item + '"' +
      'after:' + thirtyMinsAgo.toString() +
      '}'
    )
    )}
        ]
      ){
        metric
        measurements{
          metric
          at
          value
          unit
        }
      }
    }`
  //-------------------------------------------------------------------
  const [result] = useQuery({
    query
  })
  //--------------------------------------------------------------------
  const { data, error } = result;
  //--------------------------------------------------------------------
  //--------------------------------------------------------------------
  useEffect(() => {
    if (error) {
      dispatch(actions.metricsApiErrorAction({ error: error.message }));
      return;
    }
    if (!data) return;




    const { getMultipleMeasurements } = data
    if (selected !== []) {
      let newGraphData: any[] | never[] | { [x: string]: any; }[] = [];

      // console.log(getMultipleMeasurements);
      getMultipleMeasurements.forEach((measurement: any, i: number) => {  //looping through oilTemp/Pressure/etc.
        // console.log(measurement)
        // console.log(measurement.metric)
        // console.log(measurement.measurements)

        measurement.measurements.forEach((item: { [x: string]: any; }, j: number) => { //looping through individual measurements within oilTemp/Pressure/etc.
          if (i === 0) {
            let newDataPoint = {} as any;
            newDataPoint['name'] = item['at']
            newDataPoint[measurement.metric] = item['value']
            newGraphData.push(newDataPoint as never);

            // console.log(newDataPoint)
          } else {
            newGraphData[j][measurement.metric] = item['value']
          }
        })
      })
      // console.log(newGraphData)
      setGraphData(newGraphData as any)
    }






  }, [dispatch, data, error])
  //--------------------------------------------------------------------

  //--------------------------------------------------------------------
  return (
    <div
      style={{
        width: 1000,
        margin: 25
      }}
    >
      <Autocomplete
        multiple
        options={selections}
        getOptionLabel={option => option.title}
        style={{ width: 1000 }}
        renderInput={params => (
          <TextField
            {...params}
            label="Metrics"
            variant="outlined"
            fullWidth
          />
        )}
        onChange={(event, values) => {
          handleChangeSelected(event, values);
        }}
      />
      {selected.length > 0 ?
        <LineChart width={1000} height={600} data={graphData}>
          {
            selected.map((item: string) => (
              <Line type="monotone" dataKey={item} stroke={lineColor[item]} />
            ))
          }
          {/* <CartesianGrid stroke="#ccc" /> */}
          <XAxis dataKey="name" />
          <YAxis />
        </LineChart>
        : null}
    </div>
  )
}
//--------------------------------------------------------------------
const client = createClient({
  url: 'https://react.eogresources.com/graphql',
});
//--------------------------------------------------------------------
export default () => {
  return (
    <Provider value={client}>
      <Metrics />
    </Provider>
  );
};