import React, { useEffect, useState } from 'react';
import axios from 'axios';

import './ToolHeader.css';

import MarketChart from './MarketChart'
import { symbolData } from "./symbolData";
import { toast } from 'react-toastify';

const defaultStartTime = '2024-01-01';

const defaultStart = {
    minitus: ['1m', '3m', '5m', '15m', '30m'],
    hour: ['1h', '3d', '4h', '6h', '8h', '12h'],
    day: ['1d', '1w', '1M']
}
const Backtesting = () => {

    const [symbol, setSymbol] = useState(symbolData)
    const [state, setState] = useState({
      symbol: '',
        interval: '',
        startTime: new Date(defaultStartTime).toISOString().split('T')[0],
        endTime: new Date().toISOString().split('T')[0],
        limit: 1000,
    });
    const [analyze, setAnalyze] = useState({});

    const handleAnalyzeClick = async () => {
        if (!state.symbol || !state.symbol === '') {
            toast("Please choose type of Symbol", { type: "warning" });
            return;
        }
        if (!state.interval || !state.interval === '') {
            toast("Please choose Interval", { type: "warning" });
            return;
        }
        if (!state.startTime || !state.startTime === '') {
            toast("Please choose startTime", { type: "warning" });
            return;
        }
        if (!state.endTime || !state.endTime === '') {
            toast("Please choose endTime", { type: "warning" });
            return;
        }
        if (state.startTime === state.endTime && state.startTime === new Date()) {
            toast(`You request ${state.symbol} Analyzed data for only Today`, { type: "success" });
        }

        axios.post('http://146.19.106.229:5000/api/market-data', {
            symbol: state.symbol.replace(/\d+$/, ""),
            interval: state.interval,
            startTime: new Date(state.startTime).getTime(),
            endTime:  new Date(state.endTime).getTime(),
            limit:100
        }).then((response) => {
                toast(`Success Received the ${state.symbol} Analyze Data from ${new Date(state.startTime).toISOString().split('T')[0]};
                to ${new Date(state.endTime).toISOString().split('T')[0]} via interval ${state.interval}`, { type: "success" })
                
                if (response.data.marketData.length < 100) {
                    toast(`${state.symbol} Trade data is very small. ${response.data.marketData.length}`, { type: "info" });
                    return;
                }
                setAnalyze(response.data)
            })
            .catch((error) => {
                toast("Data Damaged because Net speed is very slow", { type: "info" });
                console.error('Error fetching market data:', error)
            });
        setState({
            symbol: '',
            interval: '',
            startTime: new Date(defaultStartTime).toISOString().split('T')[0],
            endTime: new Date().toISOString().split('T')[0],
            limit:1000
        })
    };

    const handleTermChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const handleChange = (key, val) => {
        setState((prevState) => ({
            ...prevState,
            [key]: val, // Dynamically set the property
        }));
    };

    const fetchSymbol = async () => {
        try {
            const response = await axios.get('https://api.binance.us/api/v3/ticker/price');
            setSymbol(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className='chart-header'>
                <div className='tool-group'>
                    <div className='form-group'>
                        <span>Symbol
                            {state.symbol !=='' 
                                ?<span className="required">*</span>
                                :<span className="require">*</span>
                            }
                        </span>
                        <select
                            className='form-style'
                            name="symbol"
                            onChange={handleSelectChange}
                            value={state.symbol}
                        >
                            <option value="">Select a symbol...</option>
                            {symbol.map((cureency, idx) => (
                                <option
                                    key={idx}
                                    value={cureency.symbol}
                                >   {`${cureency.symbol}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group'>
                        <span>Interval
                            {state.interval !=='' 
                                ?<span className="required">*</span>
                                :<span className="require">*</span>
                            }
                        </span>
                        <select
                            className='form-style'
                            name="interval"
                            onChange={handleSelectChange}
                            value={state.interval}
                        >
                            <option value="">Select a interval...</option>
                            {defaultStart.minitus.map((minitus, idx) => (
                                <option key={idx} id={`tool-start_m_${minitus}`}>{minitus}</option>
                            ))}
                            {defaultStart.hour.map((hour, idx) => (
                                <option key={idx} id={`tool-start_h_${hour}`}>{hour}</option>
                            ))}
                            {defaultStart.day.map((day, idx) => (
                                <option key={idx} id={`tool-start_d_${day}`}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group'>
                        <div className='form-group'>
                        <span>StartDay
                            {new Date(state.startTime).toISOString().split('T')[0] !== new Date(defaultStartTime).toISOString().split('T')[0]
                                ?<span className="required">*</span>
                                :<span className="require">*</span>
                            }
                        </span>
                            <input
                                type='date'
                                className='form-style'
                                name='startTime'
                                value={state.startTime}
                                min={new Date(defaultStartTime)}
                                max={state.endTime}
                                onChange={handleTermChange}
                            />
                        </div>
                        <div className='form-group'>
                            <span>EndDay
                                {new Date(state.endTime).toISOString().split('T')[0] !== new Date().toISOString().split('T')[0]
                                    ?<span className="required">*</span>
                                    :<span className="require">*</span>
                                }
                            </span>
                            <input
                                type='date'
                                className='form-style'
                                name='endTime'
                                min={state.startTime}
                                max={new Date(state.endTime).toISOString().split('T')[0]}
                                value={state.endTime}
                                onChange={handleTermChange}
                            />
                        </div>
                    </div>
                    <div className='form-group'>
                        <span>Analyze</span>
                        <button
                            className='btn-analize'
                            id={`tool_analyze`}
                            name={`analyze`}
                            onClick={handleAnalyzeClick}
                        >
                            Start
                        </button>
                    </div>

                </div>
            </div>
            <MarketChart prAnalyze={analyze} />
        </>
    );
}

export default Backtesting