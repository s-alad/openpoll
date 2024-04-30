import { BarChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import Poll from '@openpoll/packages/models/poll';
import MCPoll, { MCResponses } from '@openpoll/packages/models/poll/mc';
import ShortPoll from '@openpoll/packages/models/poll/short';

interface PollChartProps {
    poll?: MCPoll;
}

export default function RenderBarChart({ poll }: PollChartProps) {
    const [pollData, setPollData] = useState<{ label: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showChart, setShowChart] = useState(false);
    
    useEffect(() => {
        async function extractPollData() {
            if (!poll) return; // Exit early if poll is not available
            console.log(poll);
            const options = poll.options;
            const responses: MCResponses = poll.responses;

            if (!responses || !options) {
                setLoading(false); 
                setShowChart(false);
                return; // Exit early if responses or options are not available
            }
               
            console.log(options, responses);
            const currentPollData = options.map((currentOption) => {
                const optionLabel = currentOption.letter;
                const optionValue = Object.values(responses).filter((response) => response.response.includes(optionLabel)).length;
                return { label: optionLabel, value: optionValue };
            });
            setShowChart(true);
            setPollData(currentPollData);
            setLoading(false);
        }

        extractPollData();
    }, [poll]);

    if (!showChart) return null;

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <BarChart 
                        dataset={pollData}
                        yAxis={[{ scaleType: "band", dataKey: "label"}]}
                        series={[{ dataKey: "value", label: "# of Answers"}]}
                        width={500}
                        height={400}
                        layout="horizontal"
                        sx={{
                            // Style the bars dynamically based on their index
                            "& .MuiBarElement-root": {
                                "&:nth-of-type(1)": { fill: "#FBB91B" },
                                "&:nth-of-type(2)": { fill: "#FE6768" },
                                "&:nth-of-type(3)": { fill: "#9596FF" },
                                "&:nth-of-type(4)": { fill: "blue" },
                                "&:nth-of-type(5)": { fill: "purple" },
                            },
                            // Change left yAxis label styles
                            "& .MuiChartsAxis-tickLabel": {
                                strokeWidth: "0.4",
                                fontSize: "20px",
                                fontWeight: "bold",
                                fontFamily: "'Open Sans', sans-serif",
                            },
                        }}
                    />
                </div>
            )}
        </div>
    );
}
