const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Xendit, Invoice, PaymentRequest } = require('xendit-node');



module.exports.payGcash = async (req,res) => {
  const YOUR_SECRET_KEY = 'xnd_development_POyuz5jRjC6pmt45msNOB126rIexa4MjXNSAFO2kz2t0FKOyiw9zDXBhDHbrgS';

  const xendit = new Xendit({ secretKey: YOUR_SECRET_KEY });
  // const xenditPaymentRequestClient = new PaymentRequestClient({ secretKey: YOUR_SECRET_KEY });
  const { Invoice } = xendit
  const { PaymentRequest } = xendit


  const data = {
    "amount" : req.body.amount,
    "invoiceDuration" : 1800,
    "externalId" : req.body.externalId,
    "description" : req.body.description,
    "currency" : "PHP",
    "reminderTime" : 1
  }

  const response= await Invoice.createInvoice({
    data
})

console.log(response)


res.send(response)

}

module.exports.checkPaymentStatus = async (req,res) => {
  const {invoiceId} = req.params
  const YOUR_SECRET_KEY = 'xnd_development_POyuz5jRjC6pmt45msNOB126rIexa4MjXNSAFO2kz2t0FKOyiw9zDXBhDHbrgS';

  const xendit = new Xendit({ secretKey: YOUR_SECRET_KEY });

  const { Invoice } = xendit



const response= await Invoice.getInvoiceById({
  invoiceId: invoiceId
})

res.send(response)

}

