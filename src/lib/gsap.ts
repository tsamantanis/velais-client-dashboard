import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("snappy", "0.65, 0.01, 0.05, 0.99");

export { gsap, useGSAP };
