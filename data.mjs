/**
 * manage the list of randomly selected posts
 */

import fs from 'node:fs';
import moment from 'moment';
export default class Data {
    constructor() {
        this.maxRotation = 10;
        this.maxLife = 60; //minutes

        let fileData = fs.readFileSync('./data.json');
        this.posts = fileData?JSON.parse(fileData):[];
        this.rotate();
    }

    /**
     * Get the post at the top of list. It gets sorted by votes
     * and pruned by expiration
     */
    featured() {
        return this.posts[0];
    }

    /**
     * Given a post, randomly select it based on traffic.
     */
    tryEntry(body) {
        if (this.posts.length < this.maxRotation) {
            let record = {
                id:Data.createid(),
                exp:moment().add(this.maxLife,'minutes').valueOf(),
                ups:0,
                downs:0,
                body:body
            }
            this.posts.push(record);
            return record;
        } else {
            return {};
        }
    }

    /**
     * Up or down vote a post
     */
    vote(id,stance) {
        let index = this.posts.findIndex((post)=>{return post.id === id})
        if (index >= 0) this.posts[index][stance?'ups':'downs']++;
        this.posts.sort((a,b)=>{
            if (a.ups - a.downs === b.ups - b.downs) return 0;
            return (a.ups - a.downs > b.ups - b.downs)?-1:1;
        })
        return {vote:stance};
    }

    /**
     * Return current selection of posts
     */
    list() {
        return this.posts;
    }

    rotate() {
        this.posts = this.posts.reduce((accumulator,post)=>{
            if (moment().subtract(this.maxLife,'minutes').isBefore(moment(post.exp))) {
                accumulator.push(post);
            }
            return accumulator;
        },[])
        fs.writeFileSync('./data.json',JSON.stringify(this.posts));
        setTimeout(this.rotate.bind(this),2000);
    }

    static createid() {
        let id = '';
        for (let i = 0; i < 16; i++) {
            id += Number(Math.round(Math.random() * 25) + 10).toString(36);
        }
        return id;
    }
}
