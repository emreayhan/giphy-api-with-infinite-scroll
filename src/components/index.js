import React, { Component } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			hasMore: true,
			isLoading: false,
			items: [],
            term: 'ronaldo',
            totalCount: null,
            count:null,
			isNewItems:false,
			offset:0,
			limit:25

		};

		// Binds our scroll event handler
		window.onscroll = debounce(() => {
			const { loadItems, state: { error, isLoading, hasMore } } = this;

			// Bails early if:
			// * there's an error
			// * it's already loading
			// * there's nothing left to load
			if (error || isLoading || !hasMore) return;

			// Checks that the page has scrolled to the bottom
			if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
				loadItems(this.state.term);
			}
		}, 100);
	}

	componentWillMount() {
		this.loadItems(this.state.term,this.state.offset);
	}

	loadItems = (term,offset) => {
		if(offset === 0) {
			offset = 0
		}else {
			this.setState({offset :this.state.offset + this.state.limit})
		}
		this.setState({ isLoading: true }, () => {
			axios
				.get(
					`https://api.giphy.com/v1/gifs/search?api_key=UpWTb2nKpObZivyMp6OnnKzs4y4S6KTi`,{
						params:{
							q: term,
							limit:this.state.limit,
							offset:this.state.offset,
							rating:'G',
							lang:'en'
						}
					}
				)
				.then((response) => {
					const nextItems = response.data.data.map((item) => ({
						id: item.id,
						embed_url: item.embed_url,
						url: item.url
					}));

					// Merges the next items into our existing items
					this.setState({
						hasMore: this.state.items.length < 200,
						isLoading: false,
						items: [ ...this.state.items, ...nextItems ]
					});
				})
				.catch((err) => {
					this.setState({
						error: err.message,
						isLoading: false
					});
				});
		});
	};


    

    
    handleChange = (term) => {
        this.setState({term});
	}

    getItems = async () => {
        await this.loadItems(this.state.term,this.state.offset )
	};
	
	handleKeyDown = (e) => {
		if(e.keyCode==="13"){
			this.getItems();
		}
	}


	render() {
		
		const { error, hasMore, isLoading, items } = this.state;
			return (
				<div className="container">
					<h1>GIPHY</h1>
					<div className="inputWithIcon">
						<input
							className="input"
							type="text"
							value={this.state.term} 
							onChange={e => this.handleChange(e.target.value)}
						/>
						<FontAwesomeIcon className="FontAwesomeIcon" icon={faSearch} onClick={async () => {
							await this.setState({items:[]})
							await this.getItems()
						}}
						/>
					</div>
	
					{items && <div className="list">
						{items.map((item) => (
							<div style={{margin:"10px"}} key={item.id}>
								<iframe
									src={item.embed_url}
									width="auto"
									height="auto"
									frameBorder="0"
									className="giphy-embed"
									allowFullScreen
								/>
							</div>
						))}
					</div>}
					{!items && <div style={{color:"white"}}>Loading...</div>}
					<hr />
	
					{error && <div style={{ color: '#900' }}>{error}</div>}
					{isLoading && <div>Loading...</div>}
					{!hasMore && <div>You did it! You reached the end!</div>}
				</div>
			);
		}
}

export default Home;
