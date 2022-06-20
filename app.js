const express=require('express');
const app=express();
const path=require('path');
// const bodyParser=require('body-parser');
const fs=require('fs');
const mongoose = require('mongoose');
const User=require('./model');

const dotenv = require('dotenv');
const alert=require('alert');

// const ps = require('prompt-sync');
// const prompt=ps();
// const prompt=ps({sigint:true});

// const popup = require('node-popup');
// import {prompt} from 'node-popup';
// const {prompt}=require('node-popup');
dotenv.config();


// express specific stuff
app.use('/static',express.static('static'));
app.use(express.urlencoded());
// app.use(bodyParser.urlencoded({extended:true}));


// pug specific stuff
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));


mongoose.connect(process.env.MONGO_URI,
()=>{
    console.log("connected to mongodb"),
    e=>{
        console.log(e);
    }
});


let history = [];

//Endpoints
app.get('/',(req,res)=>{
   
    res.status(200).render('home.pug');
})
app.get('/history',async(req,res)=>{
    try{
        // const users= await User.find();
        const params={history};
        res.status(200).render('history.pug',params);
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})

app.post('/viewTransactions',async(req,res)=>{
    try{
        const user=req.body.transfer;
        const sender=await User.findById(user);
        res.status(200).render('transfer.pug');
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})
app.post('/addFunds',async(req,res)=>{
    try{
        const sender=req.body.add;
        const funds=Number(req.body.funds);
        const user=await User.findById(sender);
        user.balance+=funds;
        await user.save();
        const params={user};
        res.status(200).render('customer_details.pug',params);
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})
app.post('/withdrawFunds',async(req,res)=>{
    try{
        const sender=req.body.transfer;
        const funds=Number(req.body.withdraw);
        const user=await User.findById(sender);
        if(funds>user.balance){
            alert('You do not have any  Balance left in your account to Withdraw!');
            let params={user};
            res.status(200).render('customer_details.pug',params);
        }
        else{
            user.balance-=funds;
            await user.save();
            const params={user};
            res.status(200).render('customer_details.pug',params);
        }
        
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})
app.post('/transferFunds',async(req,res)=>{
    try{
        const user=req.body.transfer;
        const sender=await User.findById(user);
        const users= await User.find();
        const params={sender,users};
        res.status(200).render('transfer.pug',params);

    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})
app.get('/transfer',async(req,res)=>{
    try{
        const users= await User.find();
        const params={users};
        res.status(200).render('transfer.pug',params);
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})
app.post('/transfer',async(req,res)=>{
    sender=req.body.select1;
    receiver=req.body.select2;
    amount=Number(req.body.amount);
    const user= await User.findById(sender);
    const user2= await User.findById(receiver);
    let params={user};
    history=[user.name,user2.name,amount,user.date];
    if(amount>user.balance){
        alert('You have less Balance in your account to Transfer!');
        let params={user};
        res.status(200).render('customer_details.pug',params);
    }else{
        user.balance-=amount;
        user2.balance+=amount;
        await user.save();
        await user2.save();
        // const userArray=[user,user2];
        // res.send(userArray);
        params={user};
        alert(`Your money has been  Transferred Successfully to ${user2.name}`);
        res.status(200).render('customer_details.pug',params);
    }

})
app.get('/members', async(req, res) => {
    try{
        const users= await User.find();
        const params={users};
        res.status(200).render('members.pug',params);
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})

app.post('/customer_details', async(req, res) => {
    try{
        const sender=  req.body.clickBtn;
        const user= await User.findById(sender);
        const users= await User.find();
        const params={user,users};
        res.status(200).render('customer_details.pug',params);
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})
app.get('/add', async(req, res) => {
    res.status(200).render('add.pug');     
})
app.post('/add', async(req, res) => {
    try{
    const user=new User({
        name:req.body.name,
        email:req.body.email,
        balance:req.body.balance,
        accountNo:req.body.accountNo
    })
   
        await user.save();
        res.status(200).render('add.pug');
    }
    catch(err){
        console.log("error"+err);
        res.send('error'+err);
    }
})



const port=process.env.PORT || 8000;
//starting the server
app.listen(port,()=>{
    console.log(`starting at port ${port}`);
})

