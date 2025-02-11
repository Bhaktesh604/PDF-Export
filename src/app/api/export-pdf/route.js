import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'path';
import { NextResponse } from 'next/server';

function paginateData(products, itemsPerPage) {
  const pages = [];
  for (let i = 0; i < products.length; i += itemsPerPage) {
    pages.push(products.slice(i, i + itemsPerPage));
  }
  return pages;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { products, totalCost, logoImage, bankDetails, shipping } = body;
      console.log(products.length);
      
    const itemsPerPage = 10;
    // const paginatedProducts = products;
    const paginatedProducts = paginateData(products, itemsPerPage);


    // const templatePath = path.join(process.cwd(), 'src/views', 'product.ejs');
    const templatePath = path.join(process.cwd(), 'src/views', 'product.ejs');
    const html = await ejs.renderFile(templatePath, {
      paginatedProducts,
      totalCost,
      logoImage,
      bankDetails,
      shipping,
      date: new Date().toLocaleDateString(),
      contactEmail: "reasureleb@gmail.com",
      contactPhone: "+91 75738 75177",
    });

    // return new NextResponse(html, {
    //   headers: {
    //     'Content-Type': 'text/html',
    //   },
    // });
    
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=products.pdf',
      },
    });
  } catch (error) {
    console.log('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate PDF', error: error.message },
      { status: 500 }
    );
  }
}