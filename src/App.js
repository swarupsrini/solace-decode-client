import './App.css';
import { EventContext } from "./solace/Messaging";
import Messages from "./Messages";
import ChannelsList from "./ChannelsList";
import { useEffect, useContext, useState } from 'react';

function App() {
	const messaging = useContext(EventContext);
	const [connected, setConnected] = useState(false);

	const [channels, setChannels] = useState([]);
	const [selectedChannel, setSelectedChannel] = useState(null);
	const [addChannelVisible, setAddChannelVisible] = useState(false);
	const [newChannelName, setNewChannelName] = useState("");

	useEffect(() => {
		const setupMessaging = () => {
			messaging.connect()
			.then(() => {
				setConnected(true);
			})
			.catch(console.error);
			messaging.on("channel", (event) => {
				channels.push(event);
				setChannels(channels);
			});
		};
		setupMessaging();
	}, [messaging]);

	const publishMessage = (message) => {
		if (connected){
			messaging.publish(`channels/${selectedChannel.id}/messages`, message);
		}
	}

	useEffect(() => {

		const fetchChannels = () => {
			fetch('http://localhost:8085/channels', {
				headers: {
					'Content-Type': 'application/json',
				}
			  })
			.then((response) => response.json())
			.then((c) => {
				setChannels(c);
				if (c.length > 0) {
					setSelectedChannel(c[0]);
				}
			})
			.catch((error) => {
				console.error(error);
				var x = [{name:'deCODE', id: 0}, {name:'Solace', id: 1}]
				setChannels(x);
				if (x.length > 0) {
					setSelectedChannel(x[0]);
				}
			});
		};
		fetchChannels();
	}, []);

	const channelChanged = (channel) => {
		console.log(channel);
		setSelectedChannel(channel);
		setChannels(channels);
	}

	const saveChannel = () => {
		fetch('http://localhost:8085/channels', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: newChannelName
			})
		}).catch(console.error)
		.finally(() => setAddChannelVisible(false));
	}

	const toggleAddChannelVisible = () => {
		setAddChannelVisible(!addChannelVisible);
	}

	const changeName = (event) => {
		setNewChannelName(event.target.value)
	}

	if (!connected) {
		return <h1>Loading</h1>;
	}

	return (
		<div className="App">
			<div className="container">
				<ChannelsList channels={channels} onChangeChannel={channelChanged} selectedChannel={selectedChannel} onNewChannel={toggleAddChannelVisible}/>
				<Messages channel={selectedChannel} />
				{addChannelVisible &&
					<div className="dialog-container">
						<div className="dialog">
							<div className="dialog-contents">
								<h2>Add a channel</h2>
								<input type="text" value={newChannelName} onChange={changeName}/>
								<button onClick={saveChannel}>Save</button>
							</div>
						</div>
					</div>
				}
			</div>
		</div>
	);
}

export default App;
