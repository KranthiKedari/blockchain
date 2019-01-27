

class star {
	constructor(data) {
		this.ra = data.ra;
		this.dec = data.dec;
		this.story = data.story;
	}

    encodeStory() {
		this.story =  Buffer.from(this.story).toString('hex');
    }

	addDecodedStory() {
		this.storyDecoded = Buffer.from(this.story, 'hex').toString('utf8');
	}
}


exports.star = star