import furniture from "../../assets/403609db54d2a0d0.webp";
import dress from "../../assets/electronics-deal.jpg";
import book from "../../assets/fashion-discount.jpg";
import type { Category, LargeCategory } from "./types";

export const categoryData: Category[] = [
  {
    id: "fashion-deals",
    title: "Fashion's Top Deals",
    products: [
      {
        id: "mens-shoes",
        name: "Men's Sports Shoes",
        image: "/mens-sports-shoes.jpg",
        offerText: "Min. 70% Off",
      },
      {
        id: "wrist-watch",
        name: "Wrist Watches",
        image: "/digital-wrist-watch.jpg",
        offerText: "Min. 90% Off",
      },
      {
        id: "laptop-bag",
        name: "Laptop Bags",
        image: "/brown-leather-laptop-bag.jpg",
        offerText: "Min. 70% Off",
      },
      {
        id: "mens-slippers",
        name: "Men's Slippers",
        image: "/mens-slippers-casual.jpg",
        offerText: "Min. 70% Off",
      },
      {
        id: "backpack",
        name: "Backpacks",
        image: "/leather-backpack-brown.jpg",
        offerText: "Min. 60% Off",
      },
      {
        id: "sunglasses",
        name: "Sunglasses",
        image: "/trendy-sunglasses.jpg",
        offerText: "Min. 50% Off",
      },
    ],
  },
  {
    id: "winter-essentials",
    title: "Winter Essentials for You",
    products: [
      {
        id: "mens-jacket",
        name: "Men's Jackets",
        image: "/mens-winter-jacket.jpg",
        offerText: "Most-loved",
      },
      {
        id: "mens-socks",
        name: "Men and Women Socks",
        image: "/colorful-socks-set.jpg",
        offerText: "Min. 50% Off",
      },
      {
        id: "mens-sweater",
        name: "Men's Sweatshirts",
        image: "/mens-sweatshirt-hoodie.jpg",
        offerText: "Min. 50% Off",
      },
      {
        id: "mens-blazer",
        name: "Men's Readymade",
        image: "/black-formal-blazer.jpg",
        offerText: "Min. 50% Off",
      },
      {
        id: "womens-sweater",
        name: "Women's Sweatshirts",
        image: "/womens-purple-sweatshirt.jpg",
        offerText: "Under रु599",
      },
      {
        id: "winter-caps",
        name: "Winter Caps",
        image: "/winter-beanie-caps.jpg",
        offerText: "Min. 60% Off",
      },
    ],
  },
  {
    id: "smartphones",
    title: "Best Deals on Smartphones",
    products: [
      {
        id: "iphone-16",
        name: "Apple iPhone 16",
        image: "/apple-iphone-blue.jpg",
        priceRange: "From रु60,499*",
      },
      {
        id: "vivo-t4x",
        name: "Vivo T4x 5G",
        image: "/vivo-t4x-smartphone.jpg",
        priceRange: "From रु13,999*",
      },
      {
        id: "moto-g86",
        name: "Moto g86 Power",
        image: "/motorola-smartphone-black.jpg",
        priceRange: "Just रु15,999*",
      },
      {
        id: "vivo-t4-lite",
        name: "Vivo T4 Lite 5G",
        image: "/placeholder.svg?height=160&width=160",
        priceRange: "Just रु10,249*",
      },
      {
        id: "vivo-t4-5g",
        name: "Vivo T4 5G",
        image: "/placeholder.svg?height=160&width=160",
        priceRange: "From रु19,999*",
      },
      {
        id: "samsung-m15",
        name: "Samsung M15",
        image: "/placeholder.svg?height=160&width=160",
        priceRange: "From रु9,999*",
      },
    ],
  },
];

export const largeCategoryData: LargeCategory[] = [
  {
    id: "electronics",
    title: "Electronics & Gadgets",
    subcategories: [
      {
        id: "smartphones",
        name: "Smartphones",
        products: [
          {
            id: "phone-1",
            name: "Latest Smartphones",
            image: "/modern-smartphone.png",
            offerText: "Min. 20% Off",
          },
          {
            id: "phone-2",
            name: "Budget Phones",
            image: "/budget-phone.jpg",
            offerText: "From रु5,999",
          },
          {
            id: "phone-3",
            name: "Premium Phones",
            image: "/premium-smartphone.jpg",
            offerText: "Up to 30% Off",
          },
          {
            id: "phone-4",
            name: "Gaming Phones",
            image: "/gaming-phone.jpg",
            offerText: "Min. 25% Off",
          },
        ],
      },
      {
        id: "laptops",
        name: "Laptops & Computers",
        products: [
          {
            id: "laptop-1",
            name: "Windows Laptops",
            image: "/windows-laptop.jpg",
            offerText: "Up to 40% Off",
          },
          {
            id: "laptop-2",
            name: "MacBooks",
            image: "/silver-macbook-on-desk.png",
            offerText: "From रु89,999",
          },
          {
            id: "laptop-3",
            name: "Gaming Laptops",
            image: "/gaming-laptop.png",
            offerText: "Up to 35% Off",
          },
          {
            id: "laptop-4",
            name: "Ultrabooks",
            image: "/ultrabook-lifestyle.png",
            offerText: "Min. 20% Off",
          },
        ],
      },
      {
        id: "accessories",
        name: "Accessories",
        products: [
          {
            id: "acc-1",
            name: "Phone Cases",
            image: "/stylish-phone-case.png",
            offerText: "Min. 50% Off",
          },
          {
            id: "acc-2",
            name: "Chargers & Cables",
            image: "/electric-vehicle-charger.png",
            offerText: "From रु199",
          },
          {
            id: "acc-3",
            name: "Screen Protectors",
            image: "/screen-protector.png",
            offerText: "Min. 60% Off",
          },
          {
            id: "acc-4",
            name: "Power Banks",
            image: "/power-bank.jpg",
            offerText: "Min. 40% Off",
          },
        ],
      },
      {
        id: "audio",
        name: "Audio & Headphones",
        products: [
          {
            id: "audio-1",
            name: "Wireless Earbuds",
            image: "/wireless-earbuds.png",
            offerText: "Min. 30% Off",
          },
          {
            id: "audio-2",
            name: "Over-Ear Headphones",
            image: "/diverse-people-listening-headphones.png",
            offerText: "Up to 50% Off",
          },
          {
            id: "audio-3",
            name: "Speakers",
            image: "/portable-speaker.png",
            offerText: "Min. 25% Off",
          },
          {
            id: "audio-4",
            name: "Microphones",
            image: "/classic-studio-microphone.png",
            offerText: "Min. 20% Off",
          },
        ],
      },
    ],
  },
  {
    id: "home-living",
    title: "Home & Living",
    subcategories: [
      {
        id: "furniture",
        name: "Furniture",
        products: [
          {
            id: "furn-1",
            name: "Sofas & Couches",
            image: "/comfortable-living-room-sofa.png",
            offerText: "Up to 60% Off",
          },
          {
            id: "furn-2",
            name: "Beds & Mattresses",
            image: "/cozy-bedroom.png",
            offerText: "Min. 40% Off",
          },
          {
            id: "furn-3",
            name: "Dining Tables",
            image: "/dining-table.jpg",
            offerText: "Min. 35% Off",
          },
          {
            id: "furn-4",
            name: "Office Chairs",
            image: "/office-chair.jpg",
            offerText: "Min. 50% Off",
          },
        ],
      },
      {
        id: "kitchen",
        name: "Kitchen Appliances",
        products: [
          {
            id: "kit-1",
            name: "Refrigerators",
            image: "/modern-refrigerator.png",
            offerText: "Min. 25% Off",
          },
          {
            id: "kit-2",
            name: "Microwaves",
            image: "/modern-microwave.png",
            offerText: "Min. 30% Off",
          },
          {
            id: "kit-3",
            name: "Cookware Sets",
            image: "/assorted-cookware.png",
            offerText: "Min. 45% Off",
          },
          {
            id: "kit-4",
            name: "Coffee Makers",
            image: "/coffee-maker.jpg",
            offerText: "Min. 40% Off",
          },
        ],
      },
      {
        id: "decor",
        name: "Home Decor",
        products: [
          {
            id: "dec-1",
            name: "Wall Art",
            image: "/wall-art.jpg",
            offerText: "Min. 50% Off",
          },
          {
            id: "dec-2",
            name: "Lighting",
            image: "/home-lighting.jpg",
            offerText: "Min. 35% Off",
          },
          {
            id: "dec-3",
            name: "Plants & Planters",
            image: "/diverse-indoor-plants.png",
            offerText: "Min. 40% Off",
          },
          {
            id: "dec-4",
            name: "Rugs & Carpets",
            image: "/rug.jpg",
            offerText: "Min. 55% Off",
          },
        ],
      },
      {
        id: "bedding",
        name: "Bedding & Bath",
        products: [
          {
            id: "bed-1",
            name: "Bed Sheets",
            image: "/bed-sheets.jpg",
            offerText: "Min. 50% Off",
          },
          {
            id: "bed-2",
            name: "Pillows",
            image: "/fluffy-pillows.png",
            offerText: "Min. 40% Off",
          },
          {
            id: "bed-3",
            name: "Towels",
            image: "/towels.jpg",
            offerText: "Min. 45% Off",
          },
          {
            id: "bed-4",
            name: "Comforters",
            image: "/cozy-comforter.png",
            offerText: "Min. 50% Off",
          },
        ],
      },
    ],
  },
];

import mobile from "../../assets/403609db54d2a0d0.webp";
import jewely from "../../assets/electronics-deal.jpg";
import laptop from "../../assets/transparent-laptop.jpg";

export const productData: any = [
  {
    url: dress,
    name: "Dress",
    startingFromPrice: "5999",
  },
  {
    url: book,
    name: "Books",
    startingFromPrice: "199",
  },
  {
    url: furniture,
    name: "Furniture",
    startingFromPrice: "99999",
  },
  {
    url: jewely,
    name: "Jewely",
    startingFromPrice: "500",
  },
  {
    url: mobile,
    name: "Mobile",
    startingFromPrice: "20000",
  },
  {
    url: laptop,
    name: "Laptop",
    startingFromPrice: "30000",
  },
  {
    url: mobile,
    name: "Mobile",
    startingFromPrice: "20000",
  },
];
