import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, LineController, TimeScale  } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import './MarketChart.css';
import ReactPaginate from "react-paginate";

import buyIcon from './icon/buy.png';
import sellIcon from './icon/sell.png';


// Register necessary components in Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
  zoomPlugin,
  TimeScale,
  annotationPlugin,
);

const MarketChart = (props) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const chartInstance = useRef(null);

  const [analysisData, setAnalysisData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const currentData = analysisData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  useEffect(() => {
      console.log(props.prAnalyze,props.prAnalyze.marketData, "props data")
    if (props.prAnalyze.marketData !== undefined ) {
      const data = props.prAnalyze;
      const marketData = data.marketData.map(item => ({
        timestamp: item.timestamp,
        close: item.close
      }));

      const indicators = data.indicators;
      const buySellSignals = data.signals;

      const labels = marketData.map(d => d.timestamp);
      const closes = marketData.map(d => d.close);
      const lsmas = indicators.lsma;
      const temas = indicators.tema;
      const wmas = indicators.wma;

      const generateTradingTextAnalysis = (marketData, indicators, signals) => {
        const { lsma, tema, wma } = indicators;
        const analysis = [];
    
        // Helper function to interpret trends
        const interpretTrend = (current, previous) =>
            current > previous ? "an upward trend" : current < previous ? "a downward trend" : "an easing trend";
    
        // Helper function to detect cross behavior
        const detectCross = (line1, line2) => {
            if (line1 > line2) return "a golden cross";
            if (line1 < line2) return "a dead cross";
            return "neutral positioning";
        };
    
        signals.forEach((signal, index) => {
            const operation = signal.type === "buy" ? "Buy" : "Sell";
            const closePrice = signal.price;
            const seqNumber = index + 1;
    
            const currentIndex = marketData.findIndex(
                (data) => new Date(data.timestamp).getTime() === new Date(signal.timestamp).getTime()
            );
    
            let explanation = "";
   
            const currentLSMA = lsma[currentIndex - lsma.length];
            const previousLSMA = lsma[currentIndex - lsma.length - 1];
            const lsmaTrend = interpretTrend(currentLSMA, previousLSMA);

            const currentTEMA = tema[currentIndex - tema.length];
            const previousTEMA = tema[currentIndex - tema.length - 1];
            const temaTrend = interpretTrend(currentTEMA, previousTEMA);

            const currentWMA = wma[currentIndex - wma.length];
            const previousWMA = wma[currentIndex - wma.length - 1];
            const wmaTrend = interpretTrend(currentWMA, previousWMA);

            const goldenCross = detectCross(currentTEMA, currentLSMA);
            const wmaLsmaCross = detectCross(currentWMA, currentLSMA);

            explanation = `TEMA has shifted to ${temaTrend}, indicating potential market momentum. `;
            explanation += `LSMA shows ${lsmaTrend}, suggesting an intermediate market direction. `;
            explanation += `WMA has shifted to ${wmaTrend}, reflecting short-term price movements. `;

            if (operation === "Buy") {
                explanation += `This buy signal aligns with ${goldenCross} formation between TEMA and LSMA, `;
                explanation += `and ${wmaLsmaCross} between WMA and LSMA, supporting an upward trend expectation.`;
            } else if (operation === "Sell") {
                explanation += `This sell signal is triggered by ${goldenCross} weakening, `;
                explanation += `and ${wmaLsmaCross} indicating potential downward market pressure.`;
            }
    
            // Add the result to the analysis array
            analysis.push({
                sequenceNumber: seqNumber,
                operation,
                closingPrice: closePrice,
                explanation,
            });
        });
    
        return analysis;
      };
    
      const analysis = generateTradingTextAnalysis(marketData, indicators, buySellSignals);
      setAnalysisData(analysis);

      const buySellPoints = buySellSignals.map(signal => ({
        x: signal.timestamp,
        y: signal.price,
        type: signal.type // buy or sell
      }));

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Buy/Sell Signals',
            data: buySellPoints,
            borderColor: 'grey',
            backgroundColor: '#10e5c98c',
            borderWidth: 2,
            pointRadius: 10,
            showLine: false,
          },
          {
            label: 'LSMA',
            data: lsmas,
            borderColor: '#50c878',
            tension: 0,
            fill: false,
            spanGaps:true,
            pointRadius: 0.1,
          },
          {
            label: 'CLOSE',
            data: closes,
            borderColor: 'white',
            tension: 0,
            fill: false,
            spanGaps:true,
            pointRadius: 0.1,
          },
          {
            label: 'TEMA',
            data: temas,
            borderColor: '#a1c4fd',
            tension: 0,
            fill: false,
            spanGaps:true,
            pointRadius: 0.1,
          },
          {
            label: 'WMA',
            data: wmas,
            borderColor: '#ff7f11',
            tension: 0,
            fill: false,
            pointRadius: 0.1,
            spanGaps:true,
          },
        ]
      });
    }
  }, [props.prAnalyze]);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new ChartJS(chartRef.current, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const { dataset, raw, label } = context;
                  if (dataset.label === 'Buy/Sell Signals') {
                    return `Signal: ${raw.type.toUpperCase()} | Date: ${label} | Price: ${raw.y}`;
                  }
                  return `Date: ${label} | Price: ${raw}`;
                },
              },
              mode: 'index',
              intersect: false
            },
            legend: {
              display: true,
              labels: {
                  color: '#10e5c9'
              },
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true
                },
                mode: 'xy',
              }
            }
          },
          animations: true,
          scales: {
            x: {
              type: 'time',
              time: {
                  displayFormats: {
                    hour: 'MMM dd, HH:mm',
                  },
                  unit:'hour',
              },
              border: {
                color: 'grey',
              },
              grid: {
                tickColor: 'grey'
              },
              ticks: {
                color: '#10e5c9',
              },
      
            },
            y: {
              border: {
                color: 'grey'
              },
              grid: {
                tickColor: 'grey'
              },
              ticks: {
                color: '#10e5c9',
              }
            }
          }
        }
      });
    }

    chartInstance.current.resize((window.innerWidth * 1), 550);
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]); // Re-run effect when chartData changes

  return (
    <>
      <div className='average-chart'>
        <div className="custom-chart-container" >
          <canvas className='chart-part' symbol={{width:'100%', height:'400'}} ref={chartRef} />
        </div>
      </div>
      <div className='trade-analyze'>
        <h2>Trade Analysis</h2>
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          pageCount={Math.ceil(analysisData.length / itemsPerPage)}
          onPageChange={handlePageChange}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
        <table className="trade-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Price</th>
                    <th>Explanation</th>
                </tr>
            </thead>
            <tbody>
            {currentData.map((row, index) => (
              <tr key={index}>
                <td>{row.sequenceNumber}</td>
                <td>{row.operation}</td>
                <td>{row.closingPrice}</td>
                <td>{row.explanation}</td>
              </tr>
            ))}
            </tbody>
        </table>
      </div>
    </>
    
  );
};

export default MarketChart;